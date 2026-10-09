import axios from "axios";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// Base Axios Instance
// ──────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000, // 15 seconds
});

// ── Request Interceptor ──────────────────────
// Attach bearer token from localStorage on every request
apiClient.interceptors.request.use(
  (config) => {
    // Only available in browser environments
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // ✅ FIX: Handle FormData uploads - don't set Content-Type header
    // axios will automatically set it to multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (import.meta?.env?.DEV) {
      console.log(
        `📤 [API] ${config.method?.toUpperCase()} ${config.url}`,
        config.data instanceof FormData ? "[FormData]" : config.data ?? ""
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────
// Normalize errors into a consistent shape
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta?.env?.DEV) {
      console.log(`✅ [API] ${response.status}`, response.data);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      "An unexpected error occurred";

    if (import.meta?.env?.DEV) {
      console.error(`❌ [API] ${status ?? "Network Error"}:`, message);
    }

    if (error.response?.data?.code === "PLAN_LIMIT_EXCEEDED") {
      toast.error("Subscription Limit Reached", {
        description: message || "Your current plan doesn't support this action. Please upgrade your plan.",
        duration: 8000,
      });
    }

    if (status === 401) {
      if (typeof window !== "undefined") {
        const hadToken = Boolean(localStorage.getItem("token"));
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Public routes where a 401 should never forcibly redirect guest visitors to /login
        const publicPrefixes = [
          "/",
          "/discover",
          "/near-me",
          "/top-rated",
          "/new-openings",
          "/partner-with-us",
          "/pricing",
          "/search",
          "/restaurant",
          "/about",
          "/careers",
          "/privacy",
          "/security",
          "/terms",
          "/support",
          "/report-fraud",
          "/blog",
        ];

        const currentPath = window.location.pathname;
        const isPublicPage =
          currentPath === "/" ||
          publicPrefixes.some((p) => p !== "/" && currentPath.startsWith(p));

        if (currentPath !== "/login" && !isPublicPage && hadToken) {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    // Normalize the error so consumers always get the same shape
    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.data = error.response?.data;
    normalizedError.originalError = error;

    return Promise.reject(normalizedError);
  }
);

export default apiClient;