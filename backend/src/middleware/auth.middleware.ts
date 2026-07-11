import type { NextFunction, Request, Response } from "express";
import type { User as AppUser, UserRole } from "../types/index.js";

// Augment Express.User so req.user is typed as our own User everywhere.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends AppUser {}
  }
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
}

/** Requires the user to have completed role selection (any role). */
export function hasRole(req: Request, res: Response, next: NextFunction) {
  const user = req.user as AppUser | undefined;
  if (!user?.role) {
    return res.status(403).json({ error: "Account role not set. Complete sign-up first." });
  }
  return next();
}

/** Restricts a route to one or more specific roles. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AppUser | undefined;
    if (!user?.role) {
      return res.status(403).json({ error: "Account role not set. Complete sign-up first." });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: `Requires role: ${roles.join(" or ")}` });
    }
    return next();
  };
}