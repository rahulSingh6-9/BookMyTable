import AdminLog from "../../models/adminLog.model.js";

export const handleAdminLogSync = async (topic, payload) => {
  try {
    const adminLogData = {
      action: "",
      adminId: "SYSTEM", // Default if not provided
      targetType: "admin_invitation",
      targetId: payload.invitationId || payload.email,
      ipAddress: payload.ipAddress || "",
      metadata: { ...payload },
    };

    switch (topic) {
      case "admin.invited":
        adminLogData.action = "ADMIN_INVITATION_CREATED";
        // If inviter is known, use their ID (might be passed as adminId or invitedBy)
        adminLogData.adminId = payload.adminId || "SYSTEM";
        await AdminLog.create(adminLogData);
        break;

      case "admin.joined":
        // 1. Log Acceptance
        adminLogData.action = "ADMIN_INVITATION_ACCEPTED";
        adminLogData.adminId = payload.userId || "SYSTEM"; // The user who accepted
        await AdminLog.create(adminLogData);

        // 2. Log Membership Created
        adminLogData.action = "ADMIN_MEMBERSHIP_CREATED";
        adminLogData.targetType = "admin_membership";
        adminLogData.targetId = payload.adminId || payload.userId;
        await AdminLog.create(adminLogData);
        break;

      case "admin.invitation.viewed":
        adminLogData.action = "ADMIN_INVITATION_VIEWED";
        await AdminLog.create(adminLogData);
        break;

      case "admin.invitation.failed":
        adminLogData.action = "ADMIN_INVITATION_FAILED";
        await AdminLog.create(adminLogData);
        break;

      case "admin.invitation.revoked":
        adminLogData.action = "ADMIN_INVITATION_REVOKED";
        adminLogData.adminId = payload.adminId || "SYSTEM";
        await AdminLog.create(adminLogData);
        break;

      case "admin.invitation.sent":
        adminLogData.action = "ADMIN_INVITATION_SENT";
        await AdminLog.create(adminLogData);
        break;

      case "admin.invitation.expired":
        adminLogData.action = "ADMIN_INVITATION_EXPIRED";
        await AdminLog.create(adminLogData);
        break;

      default:
        console.log(`⚠️ Unknown admin log topic: ${topic}`);
    }

    console.log(`✅ AdminLog Created for topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Error creating AdminLog for topic [${topic}]:`, error);
  }
};
