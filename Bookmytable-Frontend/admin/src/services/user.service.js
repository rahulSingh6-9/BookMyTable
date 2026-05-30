import api from "../lib/api";

export function getMe() {
    return api.get("/users/me", )
}

export async function getAllUsers() {
    const response = await api.get("/admin/users");
    return response.data;
}

export async function getUserDetails(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
}

export async function getUserActivity(id) {
    const response = await api.get(`/admin/users/${id}/activity`);
    return response.data;
}

export async function getUserBookings(id) {
    const response = await api.get(`/admin/users/${id}/bookings`);
    return response.data;
}

export async function getUserRestaurants(id) {
    const response = await api.get(`/admin/users/${id}/restaurants`);
    return response.data;
}

export async function blockUser(id) {
    const response = await api.patch(`/admin/users/${id}/ban`);
    return response.data;
}

export async function unblockUser(id) {
    const response = await api.patch(`/admin/users/${id}/unban`);
    return response.data;
}

export async function changeUserRole(id, role) {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
}

export async function forceLogoutUser(id) {
    const response = await api.post(`/admin/users/${id}/force-logout`);
    return response.data;
}
