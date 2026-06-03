import api from "../lib/api";

export const invitationService = {
  // Get all invitations
  getInvitations: async (params) => {
    const response = await api.get("/admin/invitations", { params });
    return response.data;
  },

  // Create a new invitation
  createInvitation: async (data) => {
    const response = await api.post("/admin/invitations", data);
    return response.data;
  },

  // Revoke an invitation
  revokeInvitation: async (id) => {
    const response = await api.patch(`/admin/invitations/${id}/revoke`);
    return response.data;
  },

  // Resend an invitation
  resendInvitation: async (id) => {
    const response = await api.post(`/admin/invitations/${id}/resend`);
    return response.data;
  },

  // Get RBAC configuration
  getRBACConfig: async () => {
    const response = await api.get("/admin/invitations/config");
    return response.data;
  },
};
