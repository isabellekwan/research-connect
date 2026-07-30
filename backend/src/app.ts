import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import studiesRoutes from "./routes/studies.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

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

// 3. Mount feature routes.
app.use("/auth", authRoutes);
app.use("/studies", studiesRoutes);
app.use("/analytics", analyticsRoutes);

const PORT = Number(process.env.PORT || 4100);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
