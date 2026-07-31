import type {
    NextFunction, Request, Response
} from "express";
import { describe, expect, it, vi } from "vitest";
import { hasRole, isAuthenticated, requireRole } from "../src/middleware/auth.middleware.js";

function createResponse() {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();

  return {
    response: {
      status,
      json,
    } as unknown as Response,
    status,
    json,
  };
}

describe("authentication middleware", () => {
  it("returns 401 for an unauthenticated request", () => {
    const req = {
      isAuthenticated: () => false,
    } as Request;

    const { response, status, json } =
      createResponse();

    const next = vi.fn() as NextFunction;

    isAuthenticated(req, response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: "Not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows an authenticated request", () => {
    const req = {
      isAuthenticated: () => true,
    } as Request;

    const { response } = createResponse();
    const next = vi.fn() as NextFunction;

    isAuthenticated(req, response, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects a user without a role", () => {
    const req = {
      user: { role: null },
    } as Request;

    const { response, status } =
      createResponse();

    const next = vi.fn() as NextFunction;

    hasRole(req, response, next);

    expect(status).toHaveBeenCalledWith(403);
  });

  it("allows a participant through participant authorization", () => {
    const req = {
      user: { role: "participant" },
    } as Request;

    const { response } = createResponse();
    const next = vi.fn() as NextFunction;

    requireRole("participant")(
      req,
      response,
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejects a participant from researcher authorization", () => {
    const req = {
      user: { role: "participant" },
    } as Request;

    const { response, status } =
      createResponse();

    const next = vi.fn() as NextFunction;

    requireRole("researcher")(
      req,
      response,
      next
    );

    expect(status).toHaveBeenCalledWith(403);
  });

  it("allows a researcher through researcher authorization", () => {
    const req = {
      user: { role: "researcher" },
    } as Request;

    const { response } = createResponse();
    const next = vi.fn() as NextFunction;

    requireRole("researcher")(
      req,
      response,
      next
    );

    expect(next).toHaveBeenCalledOnce();
  });
});