import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Restaurant API
// ──────────────────────────────────────────────

export function getMyRestaurant() {
  return apiClient.get('/restaurants/my')
}

/**
 * Get all restaurants (public, supports query params for filtering).
 * @param {object} params - optional query params (city, cuisine, etc.)
 */
export function getRestaurants(params = {}) {
  return apiClient.get("/restaurants", { params });
}

/**
 * Get nearby restaurants using geographic coordinates and radius.
 * @param {object} params - { lat, lng, radius, limit, cuisine, minRating, sort }
 */
export function getNearbyRestaurants(params) {
  return apiClient.get("/restaurants/nearby", { params });
}

/**
 * Get a single restaurant by ID.
 * @param {string} id
 */
export function getRestaurantById(id) {
  return apiClient.get(`/restaurants/${id}`);
}

/**
 * Create a new restaurant (owner only).
 * @param {object} data
 */
export function createRestaurant(data) {
  return apiClient.post("/restaurants", data);
}

/**
 * Update an existing restaurant (owner only).
 * @param {string} id
 * @param {object} data
 */
export function updateRestaurant(id, data) {
  return apiClient.put(`/restaurants/${id}`, data);
}

/**
 * Delete a restaurant (owner or admin).
 * @param {string} id
 */
export function deleteRestaurant(id) {
  return apiClient.delete(`/restaurants/${id}`);
}

/**
 * Get restaurant settings (opening hours, etc.)
 * @param {string} restaurantId
 */
export function getRestaurantSettings(restaurantId) {
  return apiClient.get(`/restaurants/${restaurantId}/settings`);
}

/**
 * Update restaurant settings.
 * @param {string} restaurantId
 * @param {object} data
 */
export function updateRestaurantSettings(restaurantId, data) {
  return apiClient.put(`/restaurants/${restaurantId}/settings`, data);
}

/**
 * Upload restaurant cover image.
 * @param {string} restaurantId
 * @param {FormData} formData
 */
export function uploadRestaurantImage(restaurantId, formData) {
  return apiClient.post(`/restaurants/${restaurantId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ──────────────────────────────────────────────
// Branch Lifecycle Management
// ──────────────────────────────────────────────

export function deactivateBranch(brandId, branchId, data = {}) {
  return apiClient.patch(`/brands/${brandId}/branches/${branchId}/deactivate`, data);
}

export function deleteBranch(brandId, branchId) {
  return apiClient.delete(`/brands/${brandId}/branches/${branchId}`);
}

export function restoreBranch(brandId, branchId) {
  return apiClient.patch(`/brands/${brandId}/branches/${branchId}/restore`);
}

export function permanentlyDeleteBranch(brandId, branchId) {
  return apiClient.delete(`/brands/${brandId}/branches/${branchId}/permanent`);
}

// ──────────────────────────────────────────────
// Branch Contact API
// ──────────────────────────────────────────────

export function updateBranchBasicContact(branchId, data) {
  return apiClient.patch(`/restaurants/${branchId}/contact/basic`, data);
}

export function requestBranchPhoneOTP(branchId, data) {
  return apiClient.post(`/restaurants/${branchId}/contact/phone/request`, data);
}

export function verifyBranchPhoneOTP(branchId, data) {
  return apiClient.post(`/restaurants/${branchId}/contact/phone/verify`, data);
}

export const requestBranchEmailUpdate = async (branchId, data) => {
  const response = await apiClient.post(`/restaurants/${branchId}/contact/email/request`, data);
  return response.data;
};

export const verifyBranchEmailToken = async (branchId, data) => {
  const response = await apiClient.post(`/restaurants/${branchId}/contact/email/verify`, data);
  return response.data;
};

export const updateBranchLocation = async (branchId, data) => {
  const response = await apiClient.put(`/restaurants/${branchId}/location`, data);
  return response.data;
};
