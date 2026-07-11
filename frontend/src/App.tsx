import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth.js";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { SelectRole } from "./pages/SelectRole";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";

/**
 * Decides where "/" sends the user once we know their auth state:
 *   - not logged in            -> /login
 *   - logged in, no role yet   -> /select-role
 *   - logged in, has a role    -> /dashboard
 * Shown briefly on every fresh page load while /auth/me resolves.
 */
function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F6F5F1] text-sm text-slate-500">
        Loading ResearchConnect…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.role) return <Navigate to="/select-role" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/login" element={<Login />} />
      <Route path="/select-role" element={<SelectRole />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireRole="participant">
            <ParticipantDashboard />
          </ProtectedRoute>
        }
      />
      {/* TODO: /dashboard/researcher once that feature starts */}

      {/* Unknown paths fall back through Root's auth-aware redirect logic. */}
      <Route path="*" element={<Root />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
