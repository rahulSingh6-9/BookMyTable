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
  if (!restaurantId || restaurantId === "undefined" || restaurantId === "null") {
    console.warn("[LogsService] Skipping fetch: restaurantId is missing or invalid");
    return { success: false, data: [] };
  }
  
  try {
    const response = await apiClient.get(`/logs/${restaurantId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`[LogsService] Error fetching logs for ${restaurantId}:`, error);
    throw error;
  }
};

/**
 * Get audit logs for a brand (Owner/Manager)
 * @param {string} brandId 
 * @param {object} params - { action, performedBy, startDate, endDate, limit }
 */
export const getBrandLogs = async (brandId, params = {}) => {
  if (!brandId || brandId === "undefined" || brandId === "null") {
    console.warn("[LogsService] Skipping fetch: brandId is missing or invalid");
    return { success: false, data: [] };
  }
  
  try {
    const response = await apiClient.get(`/logs/brand/${brandId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`[LogsService] Error fetching logs for brand ${brandId}:`, error);
    throw error;
  }
};

/**
 * Get global system logs (Admin only)
 * @param {object} params - { restaurantId, action, performedBy, startDate, endDate, limit, page }
 */
export const getGlobalLogs = async (params = {}) => {
  try {
    const response = await apiClient.get(`/logs/all`, { params });
    return response.data;
  } catch (error) {
    console.error("[LogsService] Error fetching global logs:", error);
    throw error;
  }
};
