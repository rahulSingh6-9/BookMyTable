import BillingReadModel from "../../models/billingReadModel.js";

export const syncBilling = async (data) => {
  const billingId = data?.id || data?._id;

  if (!billingId) {
    console.error("❌ No Billing ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await BillingReadModel.findById(billingId);

  if (existing && existing.updatedAt && incomingUpdatedAt <= existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  await BillingReadModel.findByIdAndUpdate(
    billingId,
    {
      $set: {
        ...safeData,
        _id: billingId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🧾 Billing History Read-Model Synced: ${billingId}`);
};
