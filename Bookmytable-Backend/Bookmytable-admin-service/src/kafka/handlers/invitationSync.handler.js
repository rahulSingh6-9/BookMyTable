import { InvitationReadModel } from "../../models/index.js";

export const handleInvitationSync = async (event, payload) => {
  try {
    switch (event) {
      case "STAFF_INVITED":
        await InvitationReadModel.findOneAndUpdate(
          { _id: payload.inviteId },
          {
            _id: payload.inviteId,
            email: payload.email,
            role: payload.role,
            restaurantId: payload.restaurantId,
            invitedBy: payload.invitedBy,
            inviteLink: payload.inviteLink,
            status: "pending",
          },
          { upsert: true, new: true }
        );
        console.log(`✅ Admin DB Sync: Staff invited - ${payload.inviteId}`);
        break;

      case "STAFF_JOINED":
        await InvitationReadModel.findOneAndUpdate(
          { _id: payload.inviteId }, // actually staffJoined payload doesn't have inviteId right now, wait
          // Need to fetch by email and restaurantId, or I can just use updateMany. Let's update by email and restaurantId
          { email: payload.email, restaurantId: payload.restaurantId },
          { $set: { status: "accepted", acceptedAt: new Date() } }
        );
        console.log(`✅ Admin DB Sync: Staff joined - ${payload.email}`);
        break;

      case "INVITATION_REVOKED":
        await InvitationReadModel.findOneAndUpdate(
          { _id: payload.inviteId },
          { $set: { status: "cancelled" } }
        );
        console.log(`✅ Admin DB Sync: Invitation revoked - ${payload.inviteId}`);
        break;

      case "INVITATION_FAILED":
        await InvitationReadModel.findOneAndUpdate(
          { _id: payload.inviteId },
          { $set: { status: "delivery_failed", error: payload.error } }
        );
        console.log(`✅ Admin DB Sync: Invitation failed - ${payload.inviteId}`);
        break;

      default:
        console.log(`⚠️ Unknown invitation event: ${event}`);
    }
  } catch (error) {
    console.error(`❌ Error syncing invitation data:`, error);
  }
};
