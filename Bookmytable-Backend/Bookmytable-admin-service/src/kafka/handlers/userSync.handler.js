import UserReadModel from "../../models/userReadModel.js";

export const syncUser = async (data) => {
  const userId = data?.id || data?._id || data?.userId;

  if (!userId) {
    console.error("❌ No user ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await UserReadModel.findById(userId);

  // Prevent stale overwrite
  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    console.log(`⏭️ Stale update skipped for user ${userId}`);
    return;
  }

  // Clean data for read model
  const { __v, resetPasswordToken, resetPasswordExpires, ...safeData } = data;

  await UserReadModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...safeData,
        _id: userId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`👤 Read-Model Synced: User ${userId} (${data.role || 'unknown'})`);
};
