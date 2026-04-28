import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMe } from "../services/user.service.js";
import { login as loginApi, signup as signupApi } from "../services/auth.service.js";
import { isAuthenticated as checkAuthenticated } from "../auth/helpers.js";
import { socket } from "../services/socket.js";
import { forgotPassword, resetPassword } from "../services/auth.service";

const AuthContext = createContext();

// useAuth Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // LOGIN FUNCTION
  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const token = response.data.data.token;

      localStorage.setItem("token", token);

      // Fetch full user profile
      const userRes = await getMe();
      const userData = userRes.data.data;

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Connect socket
      socket.auth = { token };
      socket.connect();
      socket.emit("join_user", userData._id);
      socket.emit("user_logged_in", { userId: userData._id });

      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || "Invalid credentials";
      toast.error(msg);
      return { success: false };
    }
  };

  // LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    socket.disconnect();
  };

  // LOAD USER ON APP STARTUP
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    const cachedUser = localStorage.getItem("user");

    if (!token) return;

    // Load from cache immediately for fast UI
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    // Refresh from API in background
    try {
      const res = await getMe();
      const userData = res.data.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      // Keep cached user — may be a transient network issue
    }

    // Connect socket
    try {
      socket.auth = { token };
      socket.connect();
      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        socket.emit("join_user", userData._id);
      }
    } catch {
      // Non-fatal — socket will reconnect on next interaction
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await loadUser();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      socket.disconnect();
    };
  }, []);

  // Derived auth state using shared helper
  const isLoggedIn = checkAuthenticated(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        socket,
        logout,
        login,
        isLoading,
        isLoggedIn,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};