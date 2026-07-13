import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AnalyticsDashboard } from "./features/analytics/AnalyticsDashboard";
import CreateStudy from "./features/study_creator/CreateStudy";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import { ResearcherDashboard } from "./pages/ResearcherDashboard";
import { SelectRole } from "./pages/SelectRole";

function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading ResearchConnect…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  if (!role) {
    return <Navigate to="/select-role" replace />;
  }

  if (role === "researcher") {
    return <Navigate to="/researcher" replace />;
  }

  if (role === "participant") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/select-role" replace />;
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* <Header /> */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;