import apiClient from "../lib/api.js";

/**
 * Staff API Service
 * Handles all staff-related operations including invites and management.
 */

/**
 * List all staff members for a restaurant
 * @param {string} restaurantId 
 */
export const listStaff = async (restaurantId, options = {}) => {
  const query = new URLSearchParams(options).toString();
  const url = query ? `/staff/${restaurantId}/list?${query}` : `/staff/${restaurantId}/list`;
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Invite a new staff member
 * @param {string} restaurantId 
 * @param {object} inviteData - { email, role, permissions }
 */
export const inviteStaff = async (restaurantId, inviteData) => {
  const response = await apiClient.post(`/staff/invite/${restaurantId}`, inviteData);
  return response.data;
};

/**
 * Update staff member details (role, permissions, status)
 * @param {string} staffId 
 * @param {object} updateData - { role, permissions, status }
 */
export const updateStaff = async (staffId, updateData) => {
  const response = await apiClient.patch(`/staff/${staffId}`, updateData);
  return response.data;
};

/**
 * Remove staff member (soft delete)
 * @param {string} staffId 
 */
export const deleteStaff = async (staffId) => {
  const response = await apiClient.delete(`/staff/${staffId}`);
  return response.data;
};

export const revokeInvite = async (restaurantId, inviteId) => {
  const response = await apiClient.post(`/staff/invite/${restaurantId}/${inviteId}/revoke`);
  return response.data;
};

export const resendInvite = async (restaurantId, inviteId) => {
  const response = await apiClient.post(`/staff/invite/${restaurantId}/${inviteId}/resend`);
  return response.data;
};

