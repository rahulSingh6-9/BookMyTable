import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth();

  // 🔥 Wait while loading
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

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // No allowed roles specified or user doesn't have required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`❌ Access denied. User role "${user.role}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
}