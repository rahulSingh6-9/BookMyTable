import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleProtectedRoute({ children, allowedRoles = [], requiredPermissions = [], requireAll = false }) {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin/Owner bypass
  const isSuperUser = user.roles?.includes("owner") || user.roles?.includes("admin") || user.role === "owner" || user.role === "admin";
  if (isSuperUser) return children;

  // 1️⃣ Check Roles
  const userRoles = user.roles || (user.role ? [user.role] : []);
  const hasRole = allowedRoles.length === 0 || allowedRoles.some(role => userRoles.includes(role));

  // 2️⃣ Check Permissions
  const userPermissions = user.permissions || [];
  const hasPermission = requiredPermissions.length === 0 || (
    requireAll 
      ? requiredPermissions.every(p => userPermissions.includes(p))
      : requiredPermissions.some(p => userPermissions.includes(p))
  );

  if (!hasRole || !hasPermission) {
    console.warn(`❌ Access denied. Permissions: ${userPermissions}, Required: ${requiredPermissions}`);
    return <Navigate to="/" replace />;
  }

  return children;
}