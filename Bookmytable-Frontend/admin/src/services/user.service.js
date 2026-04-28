import api from "../lib/api";

export function getMe() {
    return api.get("/users/me", )
}

export function getAllUsers() {
    return api.get("/admin/users");
}
