import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { SelectRole } from "./pages/SelectRole";
import { ParticipantDashboard } from "./pages/ParticipantDashboard";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
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
          {/* TODO: researcher dashboard route, once that feature starts */}

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}