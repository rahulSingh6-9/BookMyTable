import api from "../lib/api"

/**
 * Fetch all restaurants (admin).
 * @param {string} [status] - Optional filter: "pending" | "approved" | "suspended" | "rejected"
 */
export function getAllRestaurants(status) {
    const params = status ? { status } : {};
    return api.get("/admin/restaurants", { params });
}

export function approveRestaurant(id) {
    return api.patch(`/admin/restaurants/${id}/approve`);
}

export function suspendRestaurant(id) {
    return api.patch(`/admin/restaurants/${id}/suspend`);
}

export function rejectRestaurant(id) {
    return api.patch(`/admin/restaurants/${id}/reject`);
}

export function getRestaurantDetails(id) {
    return api.get(`/admin/restaurants/${id}`);
}

export function getRestaurantMetrics(id) {
    return api.get(`/admin/restaurants/${id}/metrics`);
}

export function getRestaurantTables(id) {
    return api.get(`/admin/restaurants/${id}/tables`);
}

export function getRestaurantStaff(id) {
    return api.get(`/admin/restaurants/${id}/staff`);
}