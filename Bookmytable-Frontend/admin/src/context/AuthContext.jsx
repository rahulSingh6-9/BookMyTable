import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMe } from "../services/user.service.js";
import { login as loginApi } from "../services/auth.service.js";
import { socket } from "../services/socket.js";
import { jwtDecode } from "jwt-decode";

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const ADMIN_ROLES = [
    "admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN", 
    "SUPPORT_ADMIN", "FINANCE_ADMIN", "OPERATIONS_ADMIN", 
    "CONTENT_MODERATOR", "ANALYTICS_ADMIN", "RESTAURANT_APPROVAL_MANAGER", 
    "STAFF_MANAGEMENT_ADMIN"
  ];

  const hasPermission = (permission) => {
    if (!admin?.permissions) return false;
    if (admin.permissions.includes("*")) return true;
    return admin.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!admin?.permissions) return false;
    if (admin.permissions.includes("*")) return true;
    return permissions.some(p => admin.permissions.includes(p));
  };

  const hasRole = (role) => {
    return admin?.roles?.includes(role) || admin?.roles?.includes("SUPER_ADMIN") || admin?.roles?.includes("super_admin");
  };

  const decodeAndSetAdmin = (token, userData) => {
    try {
      const decoded = jwtDecode(token);
      const enrichedAdmin = {
        ...userData,
        roles: decoded.roles || userData.roles || [],
        permissions: decoded.permissions || [],
      };
      setAdmin(enrichedAdmin);
      localStorage.setItem("admin", JSON.stringify(enrichedAdmin));
      return enrichedAdmin;
    } catch (error) {
      console.error("Error decoding token:", error);
      setAdmin(userData);
      return userData;
    }
  };

  // 🔐 ADMIN LOGIN
  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const token = response.data.data.token;

      localStorage.setItem("admin_token", token);

      // Fetch user profile
      const userRes = await getMe();
      const userData = userRes.data.data;

      // 🚫 BLOCK if not admin
      const roles = userData.roles || [];
      const isAdmin = roles.some(role => ADMIN_ROLES.includes(role));

      if (!isAdmin) {
        toast.error("Access denied: Not an admin");
        localStorage.removeItem("admin_token");
        return { success: false };
      }

      const enrichedAdmin = decodeAndSetAdmin(token, userData);

      // 🔌 Socket connection
      socket.auth = { token };
      socket.connect();
      socket.emit("join_admin", enrichedAdmin._id);

      return { success: true, admin: enrichedAdmin };
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Invalid credentials";
      toast.error(msg);
      return { success: false };
    }
  };

  // 🔓 LOGOUT
  const logout = () => {
    setAdmin(null);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    socket.disconnect();
  };

  // 🔄 LOAD ADMIN
  const loadAdmin = async () => {
    const token = localStorage.getItem("admin_token");
    const cachedAdmin = localStorage.getItem("admin");

    if (!token) return;

    if (cachedAdmin) {
      try {
        setAdmin(JSON.parse(cachedAdmin));
      } catch {
        localStorage.removeItem("admin");
      }
    }

    try {
      const res = await getMe();
      const userData = res.data.data;

      const roles = userData.roles || [];
      const isAdmin = roles.some(role => ADMIN_ROLES.includes(role));

      if (!isAdmin) {
        logout();
        return;
      }

      decodeAndSetAdmin(token, userData);
    } catch {
      // ignore errors
    }

    // 🔌 Socket
    try {
      socket.auth = { token };
      socket.connect();
      if (admin) {
        socket.emit("join_admin", admin._id);
      }
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await loadAdmin();
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => socket.disconnect();
  }, []);

  const isLoggedIn = !!admin;

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        setAdmin,
        login,
        logout,
        isLoading,
        isLoggedIn,
        hasPermission,
        hasAnyPermission,
        hasRole,
        socket,
        scope: "admin"
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};