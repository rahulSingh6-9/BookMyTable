import MembershipReadModel from "../../models/membershipReadModel.js";
import { rebuildUserProjections, rebuildBrandMetrics, rebuildBranchMetrics } from "../../services/projection.service.js";

export const syncMembership = async (data) => {
  const membershipId = data?.id || data?._id;

  if (!membershipId) {
    console.error("❌ No Membership ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await MembershipReadModel.findById(membershipId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  if (safeData.action === "MEMBERSHIP_DELETED") {
    await MembershipReadModel.findByIdAndDelete(membershipId);
    console.log(`🗑️ Membership Read-Model Deleted: ${membershipId}`);
  } else {
    await MembershipReadModel.findByIdAndUpdate(
      membershipId,
      {
        $set: {
          ...safeData,
          _id: membershipId,
          updatedAt: incomingUpdatedAt,
        }
      },
      { upsert: true, new: true }
    );
    console.log(`🎫 Membership Read-Model Synced: ${membershipId}`);
  }

  // Trigger CQRS projections
  const uId = safeData.userId || safeData.user;
  const bndId = safeData.brandId || safeData.brand;
  const brchId = safeData.branchId || safeData.branch;
  
  if (uId) await rebuildUserProjections(uId);
  if (bndId) await rebuildBrandMetrics(bndId);
  if (brchId) await rebuildBranchMetrics(brchId);
};
