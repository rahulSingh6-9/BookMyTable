import api from "../lib/api.js";

/**
 * Global Logs API Service for Admin Panel
 */
export const getGlobalLogs = async (params = {}) => {
  const response = await api.get(`/admin/logs`, { params });
  return response.data;
};
