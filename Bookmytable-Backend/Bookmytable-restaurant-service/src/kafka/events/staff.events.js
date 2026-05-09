/**
 * Standardized event builders for Staff Service
 */

export const StaffEvents = {
  staffInvited: ({ email, role, restaurantName, inviteLink, invitedBy, restaurantId, inviteId }) => ({
    eventType: "STAFF_INVITED",
    payload: {
      email,
      role,
      restaurantName,
      inviteLink,
      invitedBy: invitedBy.toString(),
      restaurantId: restaurantId.toString(),
      inviteId: inviteId.toString(),
    },
    timestamp: Date.now(),
    version: 1,
  }),
};
