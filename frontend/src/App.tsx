import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { StoreOwnerDashboard } from "./pages/StoreOwnerDashboard";

// Role-based Protected Route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <span className="w-5 h-5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if unauthorized for this specific route
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "STORE_OWNER") return <Navigate to="/owner" replace />;
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "STORE_OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/user" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Role Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={["STORE_OWNER"]}>
                    <StoreOwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Root / Fallback */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
