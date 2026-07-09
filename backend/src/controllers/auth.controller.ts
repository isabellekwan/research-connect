import type { Request, Response } from "express";
import { setUserRole } from "../models/user.model.js";
import type { User, UserRole } from "../types/index.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/** GET /auth/me — returns the current session user, or 401. */
export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ user: req.user });
}

/**
 * GET /auth/google/callback — passport has already attached req.user.
 * New users (role === null) get redirected to the role-selection screen;
 * everyone else lands on their dashboard.
 */
export function handleGoogleCallback(req: Request, res: Response) {
  const user = req.user as User;
  const destination = user.role ? "/dashboard" : "/select-role";
  res.redirect(`${FRONTEND_URL}${destination}`);
}

/** POST /auth/select-role — body: { role: "researcher" | "participant" } */
export async function selectRole(req: Request, res: Response) {
  const { role } = req.body as { role?: UserRole };
  const user = req.user as User;

  if (role !== "researcher" && role !== "participant") {
    return res.status(400).json({ error: "role must be 'researcher' or 'participant'" });
  }
  if (user.role) {
    return res.status(409).json({ error: "Role already set" });
  }

  const updated = await setUserRole(user.id, role);
  return res.json({ user: updated });
}

/** POST /auth/logout */
export function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Failed to log out" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
}