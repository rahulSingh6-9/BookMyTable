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