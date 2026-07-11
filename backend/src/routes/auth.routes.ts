import { Router } from "express";
import passport from "../config/passport.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getCurrentUser,
  handleGoogleCallback,
  logout,
  selectRole,
} from "../controllers/auth.controller.js";

const router = Router();

// Kick off Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google redirects here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5174"}/login?error=oauth_failed`,
  }),
  handleGoogleCallback
);

router.get("/me", getCurrentUser);
router.post("/select-role", isAuthenticated, selectRole);
router.post("/logout", isAuthenticated, logout);

export default router;