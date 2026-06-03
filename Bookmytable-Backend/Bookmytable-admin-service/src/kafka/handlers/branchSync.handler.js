import BranchReadModel from "../../models/branchReadModel.js";
import { rebuildBrandMetrics } from "../../services/projection.service.js";

export const syncBranch = async (data) => {
  const branchId = data?.id || data?._id;
  
  if (!branchId) {
    console.error("❌ [BranchSync] No Branch ID found in payload:", data);
    return;
  }

  console.log(`🔄 [BranchSync] Processing update for Branch: ${branchId}`, { status: data.status });

  const incomingUpdatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  const existing = await BranchReadModel.findById(branchId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    console.log(`⏭️ [BranchSync] Skipping stale update for ${branchId} (Existing: ${existing.updatedAt.toISOString()}, Incoming: ${incomingUpdatedAt.toISOString()})`);
    return;
  }

  const { __v, name, restaurantName, branchName, id, _id, emailVerified, emailVerifiedAt, contact, action, timestamp, eventType, ...safeData } = data;
  
  // Build safe partial update payload
  const setPayload = { ...safeData, _id: branchId, updatedAt: incomingUpdatedAt };

  if (branchName !== undefined) setPayload.branchName = branchName;
  else if (name !== undefined) setPayload.branchName = name;
  else if (restaurantName !== undefined) setPayload.branchName = restaurantName;

  if (emailVerified !== undefined) setPayload.emailVerified = emailVerified;
  else if (contact?.isEmailVerified !== undefined) setPayload.emailVerified = contact.isEmailVerified;

  if (emailVerifiedAt !== undefined) setPayload.emailVerifiedAt = emailVerifiedAt;
  else if (contact?.emailVerifiedAt !== undefined) setPayload.emailVerifiedAt = contact.emailVerifiedAt;

  if (safeData.email !== undefined) setPayload.email = safeData.email;
  else if (contact?.email !== undefined) setPayload.email = contact.email;

  if (data.action === "PERMANENT_DELETE") {
    const existingBranch = await BranchReadModel.findById(branchId);
    await BranchReadModel.findByIdAndDelete(branchId);
    console.log(`🗑️ [BranchSync] Permanently deleted Branch Read-Model: ${branchId}`);
    if (existingBranch && existingBranch.brandId) await rebuildBrandMetrics(existingBranch.brandId);
    return;
  }

  const updated = await BranchReadModel.findByIdAndUpdate(
    branchId,
    { $set: setPayload },
    { upsert: true, new: true }
  );

  if (updated) {
    console.log(`✅ [BranchSync] Branch Read-Model Synced: ${branchId} [Status: ${updated.status}]`);
    if (updated.brandId) await rebuildBrandMetrics(updated.brandId);
  } else {
    console.error(`❌ [BranchSync] Failed to update BranchReadModel for ${branchId}`);
  }
};
