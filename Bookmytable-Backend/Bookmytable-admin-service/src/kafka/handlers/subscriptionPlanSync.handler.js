import SubscriptionPlanReadModel from "../../models/subscriptionPlanReadModel.js";

export const syncSubscriptionPlan = async (data) => {
  const planId = data?.id || data?._id;

  if (!planId) {
    console.error("❌ No SubscriptionPlan ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await SubscriptionPlanReadModel.findById(planId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  await SubscriptionPlanReadModel.findByIdAndUpdate(
    planId,
    {
      $set: {
        ...safeData,
        _id: planId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`📋 SubscriptionPlan Read-Model Synced: ${planId}`);
};
