import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMe } from "../services/user.service.js";
import { login as loginApi } from "../services/auth.service.js";
import { socket } from "../services/socket.js";

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
      if (!userData.roles?.includes("admin")) {
        toast.error("Access denied: Not an admin");
        localStorage.removeItem("admin_token");
        return { success: false };
      }

      localStorage.setItem("admin", JSON.stringify(userData));
      setAdmin(userData);

      // 🔌 Socket connection (optional)
      socket.auth = { token };
      socket.connect();
      socket.emit("join_admin", userData._id);

      return { success: true, admin: userData };
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

    // Load cached admin
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

      // 🚫 Block if not admin
      if (!userData.roles?.includes("admin")) {
        logout();
        return;
      }

      setAdmin(userData);
      localStorage.setItem("admin", JSON.stringify(userData));
    } catch {
      // ignore errors
    }

    // 🔌 Socket
    try {
      socket.auth = { token };
      socket.connect();
      if (cachedAdmin) {
        const adminData = JSON.parse(cachedAdmin);
        socket.emit("join_admin", adminData._id);
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
        socket,
        scope: "admin"
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};