import api from "../lib/api"

/**
 * Fetch all brands (admin).
 * @param {string} [status] - Optional filter: "pending" | "approved" | "suspended" | "rejected"
 */
export function getAllBrands(status) {
    const params = status ? { status } : {};
    return api.get("/admin/brands", { params });
}

export function getBrandDetails(id) {
    return api.get(`/admin/brands/${id}`);
}

export function approveBrand(id) {
    return api.patch(`/admin/brands/${id}/approve`);
}

export function rejectBrand(id) {
    return api.patch(`/admin/brands/${id}/reject`);
}

export function suspendBrand(id) {
    return api.patch(`/admin/brands/${id}/suspend`);
}

export function getBrandRestaurants(id) {
    return api.get(`/admin/brands/${id}/restaurants`);
}

export function getBrandMetrics(id) {
    return api.get(`/admin/brands/${id}/metrics`);
}
