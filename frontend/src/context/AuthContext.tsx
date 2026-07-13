import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/authApi";
import { ApiError } from "../api/client";
import type { User, UserRole } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => void;
  selectRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: current } = await authApi.getCurrentUser();
      setUser(current);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      } else {
        console.error("Failed to load current user", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithGoogle = useCallback(() => {
    authApi.redirectToGoogleLogin();
  }, []);

  const selectRole = useCallback(async (role: UserRole) => {
    const { user: updated } = await authApi.selectRole(role);
    setUser(updated);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, selectRole, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}
