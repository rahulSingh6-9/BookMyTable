import BrandReadModel from "../../models/brandReadModel.js";

export const syncBrand = async (data) => {
  const brandId = data?.id || data?._id;

  if (!brandId) {
    console.error("❌ No Brand ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await BrandReadModel.findById(brandId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  await BrandReadModel.findByIdAndUpdate(
    brandId,
    {
      $set: {
        ...safeData,
        _id: brandId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🏷️ Brand Read-Model Synced: ${brandId}`);
};
