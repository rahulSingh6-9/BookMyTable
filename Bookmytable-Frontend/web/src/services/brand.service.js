import apiClient from "../lib/api.js";

// ──────────────────────────────────────────────
// Brand Lifecycle Management
// ──────────────────────────────────────────────

export function deactivateBrand(brandId, data = {}) {
  return apiClient.patch(`/brands/${brandId}/deactivate`, data);
}

export function archiveBrand(brandId, data = {}) {
  return apiClient.patch(`/brands/${brandId}/archive`, data);
}

export function restoreBrand(brandId, data = {}) {
  return apiClient.patch(`/brands/${brandId}/restore`, data);
}

export function getArchivedBrands() {
  return apiClient.get('/brands/archived');
}

export function updateBrandBasicContact(brandId, data) {
  return apiClient.patch(`/brands/${brandId}/contact/basic`, data);
}

export function requestBrandPhoneOTP(brandId, data) {
  return apiClient.post(`/brands/${brandId}/contact/phone/request`, data);
}

export function verifyBrandPhoneOTP(brandId, data) {
  return apiClient.post(`/brands/${brandId}/contact/phone/verify`, data);
}

export function requestBrandEmailUpdate(brandId, data) {
  return apiClient.post(`/brands/${brandId}/contact/email/request`, data);
}

export function verifyBrandEmailToken(brandId, data) {
  return apiClient.post(`/brands/${brandId}/contact/email/verify`, data);
}
