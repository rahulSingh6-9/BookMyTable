import BranchReadModel from "../../models/branchReadModel.js";

export const syncBranch = async (data) => {
  const branchId = data?.id || data?._id;

  if (!branchId) {
    console.error("❌ No Branch ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await BranchReadModel.findById(branchId);

  if (existing && existing.updatedAt && incomingUpdatedAt <= existing.updatedAt) {
    return;
  }

  const { __v, name, restaurantName, branchName, ...safeData } = data;
  const finalBranchName = branchName || name || restaurantName;

  await BranchReadModel.findByIdAndUpdate(
    branchId,
    {
      $set: {
        ...safeData,
        branchName: finalBranchName,
        _id: branchId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🏠 Branch Read-Model Synced: ${branchId}`);
};
