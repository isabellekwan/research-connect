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

/**
 * @openapi
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Start Google OAuth login
 *     description: Redirects the browser to Google's consent screen. Not an API call to fetch directly — navigate to it.
 *     responses:
 *       302:
 *         description: Redirect to Google's OAuth consent screen
 */
// Kick off Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @openapi
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Google redirects here after consent. On success, establishes a session and redirects to the frontend (`/select-role` for new users, `/dashboard` otherwise). On failure, redirects to `/login?error=oauth_failed`.
 *     responses:
 *       302:
 *         description: Redirect to the frontend
 */
// Google redirects here after consent
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5174"}/login?error=oauth_failed`,
  }),
  handleGoogleCallback
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current session user
 *     responses:
 *       200:
 *         description: The authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", getCurrentUser);

/**
 * @openapi
 * /auth/select-role:
 *   post:
 *     tags: [Auth]
 *     summary: Set the role for a newly signed-up user
 *     description: Can only be called once per account — fails with 409 if the role is already set.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [researcher, participant]
 *     responses:
 *       200:
 *         description: Role set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Role already set
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/select-role", isAuthenticated, selectRole);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and destroy the session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", isAuthenticated, logout);

export default router;
