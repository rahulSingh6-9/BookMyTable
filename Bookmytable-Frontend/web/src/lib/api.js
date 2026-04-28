import axios from "axios";

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

    // Normalize the error so consumers always get the same shape
    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.data = error.response?.data;
    normalizedError.originalError = error;

    return Promise.reject(normalizedError);
  }
);

export default apiClient;