import { API_BASE_URL, apiRequest } from "./client";
import type { User, UserRole } from "../types";

export function redirectToGoogleLogin() {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

export function getCurrentUser() {
  return apiRequest<{ user: User }>("/auth/me");
}

export function selectRole(role: UserRole) {
  return apiRequest<{ user: User }>("/auth/select-role", {
    method: "POST",
    body: { role },
  });
}

export function logout() {
  return apiRequest<{ success: true }>("/auth/logout", { method: "POST" });
}