/**
 * INTEGRATION SNIPPET — not a standalone entrypoint.
 *
 * You said the base app is already running, so rather than hand you a
 * competing app.ts, this shows exactly what to add to your existing
 * Express setup (imports, middleware order, and route mounting).
 * Copy the relevant pieces into your real bootstrap file.
 */

import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import studiesRoutes from "./routes/studies.routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.set("trust proxy", 1);
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
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

export default app;