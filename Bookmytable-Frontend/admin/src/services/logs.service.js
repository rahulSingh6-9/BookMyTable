import api from "../lib/api.js";

/**
 * Global Logs API Service for Admin Panel
 */
export const getSystemLogs = async (params = {}) => {
  const response = await api.get(`/admin/logs/system-logs`, { params });
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  const response = await api.get(`/admin/logs/audit-logs`, { params });
  return response.data;
};
