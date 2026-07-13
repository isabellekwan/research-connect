import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth.js";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { SelectRole } from "./pages/SelectRole";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { AnalyticsDashboard } from "./features/analytics/AnalyticsDashboard";
import CreateStudy from "./features/study_creator/CreateStudy";

function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading ResearchConnect…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.role) return <Navigate to="/select-role" replace />;

  return (
    <Navigate
      to={user.role === "researcher" ? "/researcher" : "/dashboard"}
      replace
    />
  );
}

function ResearcherDashboard() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="text-center">
        <h1 className="text-2xl font-semibold">Researcher Dashboard</h1>
        <p className="mt-2">
          Manage your studies and review their performance.
        </p>
        <Link to="/studies/new" className="mt-4 inline-block">
          Create Study
        </Link>
        <Link to="/analytics" className="mt-4 ml-4 inline-block">
          View Analytics
        </Link>
      </section>
    </main>
  );
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

      <Route
        path="/researcher"
        element={
          <ProtectedRoute requireRole="researcher">
            <ResearcherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/studies/new"
        element={
          <ProtectedRoute requireRole="researcher">
            <CreateStudy />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute requireRole="researcher">
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

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