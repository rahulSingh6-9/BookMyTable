import SubscriptionOverrideReadModel from "../../models/subscriptionOverrideReadModel.js";

export const syncSubscriptionOverride = async (data) => {
  const overrideId = data?.id || data?._id;

  if (!overrideId) {
    console.error("❌ No SubscriptionOverride ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await SubscriptionOverrideReadModel.findById(overrideId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  await SubscriptionOverrideReadModel.findByIdAndUpdate(
    overrideId,
    {
      $set: {
        ...safeData,
        _id: overrideId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🛠️ SubscriptionOverride Read-Model Synced: ${overrideId}`);
};
