import apiClient from "../lib/api.js";

/**
 * Logs API Service
 * Handles fetching audit logs for owners and global admins.
 */

/**
 * Get audit logs for a restaurant (Owner/Admin)
 * @param {string} restaurantId 
 * @param {object} params - { action, performedBy, startDate, endDate, limit }
 */
export const getRestaurantLogs = async (restaurantId, params = {}) => {
  const response = await apiClient.get(`/logs/${restaurantId}`, { params });
  return response.data;
};

/**
 * Get global system logs (Admin only)
 * @param {object} params - { restaurantId, action, performedBy, startDate, endDate, limit, page }
 */
export const getGlobalLogs = async (params = {}) => {
  // Assuming there's a global endpoint or we use a special restaurantId/query
  const response = await apiClient.get(`/logs/all`, { params });
  return response.data;
};
