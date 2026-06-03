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

