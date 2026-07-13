import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types";

const ROLE_OPTIONS: { role: UserRole; title: string; description: string }[] = [
  {
    role: "participant",
    title: "I'm a participant",
    description: "Browse studies, apply, and book time slots that fit your schedule.",
  },
  {
    role: "researcher",
    title: "I'm a researcher",
    description: "Create studies, screen applicants, and manage sessions.",
  },
];

export function SelectRole() {
  const { user, isLoading, selectRole } = useAuth();
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isLoading && !user) return <Navigate to="/login" replace />;
  if (!isLoading && user?.role) return <Navigate to="/dashboard" replace />;

  async function handleSelect(role: UserRole) {
    setPendingRole(role);
    setError(null);
    try {
      await selectRole(role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Something went wrong setting your role. Please try again.");
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F5F1] px-4">
      <div className="w-full max-w-lg">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">
          How will you use ResearchConnect?
        </h1>
        <p className="mb-8 text-center text-sm text-slate-500">
          This determines the tools and dashboard you'll see. You can't change it later, so pick carefully.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.role}
              onClick={() => handleSelect(option.role)}
              disabled={pendingRole !== null}
              className="rounded-lg border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-[#1F6F6B] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <h2 className="font-semibold text-slate-900">{option.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{option.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-[#1F6F6B]">
                {pendingRole === option.role ? "Setting up…" : "Choose this →"}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
