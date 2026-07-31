import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AnalyticsDashboard } from "./features/analytics/AnalyticsDashboard";
import CreateStudy from "./features/study_creator/CreateStudy";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./pages/Login";
import { LandingPage } from "./pages/LandingPage";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { ResearcherDashboard } from "./pages/ResearcherDashboard";
import { ResearcherApplications } from "./pages/ResearcherApplications";
import { SelectRole } from "./pages/SelectRole";
import { StudyApplicationPage } from "./pages/StudyApplicationPage";

function Root() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen animate-pulse bg-[#F6F5F1]" aria-label="Loading Research Connect" />;
  }

  if (!user) {
    return <LandingPage />;
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
        path="/studies/:studyId/apply"
        element={
          <ProtectedRoute requireRole="participant">
            <StudyApplicationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/researcher/applications"
        element={
          <ProtectedRoute requireRole="researcher">
            <ResearcherApplications />
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

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage/>          
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
        <Header />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
