import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // API Gateway URL
});

// 🔐 Request Interceptor (Attach Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response Interceptor (Handle Errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or unauthorized
    if (error.response?.status === 401) {
      console.log("Unauthorized - redirecting to login");

      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin");

      // redirect to login
      if (window.location.pathname !== "/login") {
         window.location.href = "/login"; 
      }
    }

    return Promise.reject(error);
  }
);

export default api;