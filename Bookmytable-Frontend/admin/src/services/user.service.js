import api from "../lib/api";

export function getMe() {
    return api.get("/users/me", )
}

export async function getAllUsers() {
    const response = await api.get("/admin/users");
    return response.data;
}
