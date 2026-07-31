import cors from "cors";
import express, {
  type RequestHandler,
} from "express";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import passport from "./config/passport.js";
import { swaggerSpec } from "./config/openapi.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import studiesRoutes from "./routes/studies.routes.js";

interface createAppOptions {
  beforeRoutes? : RequestHandler[];
}

export function createApp(
  options: createAppOptions = {}
){
  const app = express();

  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5174",
    "http://localhost:5173",
    "http://localhost:5174",
  ].filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json());

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: (process.env.SESSION_SECRET || "dev-session-secret") as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  for (const middleware of options.beforeRoutes ?? []) {
    app.use(middleware);
  }

  // 3. Mount feature routes.
  app.use("/auth", authRoutes);
  app.use("/studies", studiesRoutes);
  app.use("/analytics", analyticsRoutes);
  app.use("/users", profileRoutes);

  // API docs (OpenAPI/Swagger UI), generated from JSDoc comments in ./routes/*.
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

  return app;

}

export default createApp();
