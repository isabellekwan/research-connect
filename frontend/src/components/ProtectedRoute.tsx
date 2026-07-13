import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: UserRole;
}

export function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    return <Navigate to="/select-role" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    if (user.role === "researcher") {
      return <Navigate to="/researcher" replace />;
    }

    if (user.role === "participant") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/select-role" replace />;
  }

  return <>{children}</>;
}
