import AdminLog from "../models/adminLog.model.js";

export const createAdminLog = async ({ adminId, action, targetType, targetId, metadata, ipAddress }) => {
  try {
    const log = await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      metadata,
      ipAddress,
    });
    return log;
  } catch (error) {
    console.error("❌ Error creating admin log:", error.message);
    // Non-blocking error
  }
};
