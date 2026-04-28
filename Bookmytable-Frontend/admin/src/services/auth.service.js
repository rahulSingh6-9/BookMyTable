import api from "../lib/api";

export function login(email, password) {
    return api.post("auth/login/admin", {email, password})
}

