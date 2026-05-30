import BrandSubscriptionReadModel from "../../models/brandSubscriptionReadModel.js";

export const syncBrandSubscription = async (data) => {
  const subscriptionId = data?.id || data?._id;

  if (!subscriptionId) {
    console.error("❌ No BrandSubscription ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await BrandSubscriptionReadModel.findById(subscriptionId);

  if (existing && existing.updatedAt && incomingUpdatedAt <= existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  if (safeData.subscriptionPlanId && typeof safeData.subscriptionPlanId === "object") {
    safeData.subscriptionPlanId = safeData.subscriptionPlanId._id || safeData.subscriptionPlanId.id;
  }

  await BrandSubscriptionReadModel.findByIdAndUpdate(
    subscriptionId,
    {
      $set: {
        ...safeData,
        _id: subscriptionId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`💳 BrandSubscription Read-Model Synced: ${subscriptionId}`);
};
