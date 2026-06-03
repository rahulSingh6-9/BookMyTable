import api from "../lib/api";

export const getApprovalQueue = async () => {
    const response = await api.get("/admin/moderation/queue");
    return response.data.data;
};

export const getVerifications = async () => {
    const response = await api.get("/admin/moderation/verifications");
    return response.data.data;
};
