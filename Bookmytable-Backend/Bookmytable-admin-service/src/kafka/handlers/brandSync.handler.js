import BrandReadModel from "../../models/brandReadModel.js";
import BranchReadModel from "../../models/branchReadModel.js";

export const syncBrand = async (data, topic) => {
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

  const { __v, action, timestamp, eventType, ...safeData } = data;

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

  // Cascade lifecycle events to branches in the read model
  try {
    if (topic === "brand.deactivated") {
      await BranchReadModel.updateMany({ brandId }, { $set: { isActive: false } });
      console.log(`🏷️ Cascaded Deactivate to Branches for Brand: ${brandId}`);
    } else if (topic === "brand.archived") {
      await BranchReadModel.updateMany({ brandId }, { $set: { isActive: false, isDeleted: true, deletedAt: new Date() } });
      console.log(`🏷️ Cascaded Archive to Branches for Brand: ${brandId}`);
    } else if (topic === "brand.restored") {
      // Admin read model might over-restore here since it doesn't track archivedViaBrand, 
      // but it's acceptable for a read-model. It will heal on next branch update.
      await BranchReadModel.updateMany({ brandId }, { $set: { isActive: true, isDeleted: false, deletedAt: null } });
      console.log(`🏷️ Cascaded Restore to Branches for Brand: ${brandId}`);
    }
  } catch (error) {
    console.error(`❌ Error cascading brand event ${topic} to branches:`, error);
  }
};
