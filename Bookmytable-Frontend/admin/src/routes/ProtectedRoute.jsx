import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/context/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { admin, isLoading, scope } = useAdminAuth();
  const location = useLocation();

  // ⏳ Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ❌ Not logged in
  if (!admin) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // AuthContext already guarantees the user has a valid admin role
  // because it logs out anyone without an admin role upon fetching their profile.

  // ❌ Wrong scope (very important)
  if (scope !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}