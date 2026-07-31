import type { RequestHandler } from "express";
import { createApp } from "../src/app.js";
import type { User } from "../src/types/index.js";

export function authenticatedApp(user: User) {
  const authenticate: RequestHandler = (
    req,
    _res,
    next
  ) => {
    req.user = user;
    req.isAuthenticated = function (
        this: typeof req
    ): this is Express.AuthenticatedRequest {
        return true;
    };
    next();
  };

  return createApp({
    beforeRoutes: [authenticate],
  });
}

export function unauthenticatedApp() {
  const unauthenticated: RequestHandler = (
    req,
    _res,
    next
  ) => {
    req.isAuthenticated = function (
        this: typeof req
    ): this is Express.AuthenticatedRequest {
        return false;
    };
    next();
  };

  return createApp({
    beforeRoutes: [unauthenticated],
  });
}