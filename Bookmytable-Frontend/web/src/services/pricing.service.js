import apiClient from "../lib/api.js";

export const getPricingConfig = (branchId) => {
  return apiClient.get(`/pricing/${branchId}`);
};

export const updatePricingConfig = (branchId, data) => {
  return apiClient.post(`/pricing/${branchId}`, data);
};

export const validatePricingPassword = (password) => {
  return apiClient.post(`/pricing/auth/validate-password`, { password });
};

export const deletePricingConfig = (branchId, pricingId, password) => {
  return apiClient.delete(`/pricing/${branchId}/${pricingId}`, { data: { password } });
};
