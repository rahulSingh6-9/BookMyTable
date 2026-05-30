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
  staffJoined: ({ userId, email, role, restaurantId, brandId, membershipId }) => ({
    eventType: "STAFF_JOINED",
    payload: {
      userId: userId.toString(),
      email,
      role,
      restaurantId: restaurantId.toString(),
      brandId: brandId ? brandId.toString() : null,
      membershipId: membershipId.toString(),
    },
    timestamp: Date.now(),
    version: 1,
  }),
  invitationRevoked: ({ inviteId, restaurantId }) => ({
    eventType: "INVITATION_REVOKED",
    payload: {
      inviteId: inviteId.toString(),
      restaurantId: restaurantId.toString(),
    },
    timestamp: Date.now(),
    version: 1,
  }),
};
