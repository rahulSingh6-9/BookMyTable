import BranchReadModel from "../../models/branchReadModel.js";

export const syncBranch = async (data) => {
  const branchId = data?.id || data?._id;
  
  if (!branchId) {
    console.error("❌ [BranchSync] No Branch ID found in payload:", data);
    return;
  }

  console.log(`🔄 [BranchSync] Processing update for Branch: ${branchId}`, { status: data.status });

  const incomingUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  const existing = await BranchReadModel.findById(branchId);

  if (existing && existing.updatedAt && incomingUpdatedAt <= existing.updatedAt) {
    console.log(`⏭️ [BranchSync] Skipping stale update for ${branchId} (Existing: ${existing.updatedAt.toISOString()}, Incoming: ${incomingUpdatedAt.toISOString()})`);
    return;
  }

  const { __v, name, restaurantName, branchName, id, _id, ...safeData } = data;
  const finalBranchName = branchName || name || restaurantName;

  const updated = await BranchReadModel.findByIdAndUpdate(
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

  if (updated) {
    console.log(`✅ [BranchSync] Branch Read-Model Synced: ${branchId} [Status: ${updated.status}]`);
  } else {
    console.error(`❌ [BranchSync] Failed to update BranchReadModel for ${branchId}`);
  }
};
