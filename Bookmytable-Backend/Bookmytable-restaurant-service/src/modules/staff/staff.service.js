import crypto from "crypto";
import StaffInvite from "../../models/staffInvite.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import Restaurant from "../../models/restaurant.model.js";
import { authServiceClient } from "./auth.client.js";
import "../../models/user.model.js";

import { createLog } from "../log/log.service.js";
import redis from "../../config/redis.js";
import { getStaffCacheKey } from "../../utils/cacheKeys.js";


export const acceptInviteService = async ({ token, name, password }) => {
  // 1️⃣ Hash token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2️⃣ Find invite
  const invite = await StaffInvite.findOne({
    tokenHash,
    status: "pending",
  });

  if (!invite) throw new Error("Invalid or expired invite");

  if (invite.expiresAt < new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new Error("Invite expired");
  }

  // 3️⃣ Sync user with Auth Service
  const user = await authServiceClient.syncUser({
    email: invite.email,
    name,
    password,
    role: "staff", // Global role remains 'staff' or 'customer'
  });

  // 4️⃣ Prevent duplicate membership
  const existingMembership = await BranchMembership.findOne({
    user: user._id,
    branch: invite.restaurant,
  });

  if (existingMembership) {
    throw new Error("Already a member of this branch");
  }

  // 5️⃣ Create Branch Membership
  const membership = await BranchMembership.create({
    user: user._id,
    branch: invite.restaurant,
    role: invite.role,
    // Map simple permissions to new schema if necessary
    permissions: Array.isArray(invite.permissions) 
      ? invite.permissions.map(p => typeof p === 'string' ? { action: p, scope: 'branch' } : p)
      : [],
    status: "active",
    invitedBy: invite.invitedBy,
    joinedAt: new Date(),
  });

  // 6️⃣ Invalidate potential cache
  await clearStaffCache(user._id, invite.restaurant);

  // 7️⃣ Update invite
  invite.status = "accepted";
  invite.acceptedAt = new Date();
  await invite.save();

  if (membership.branch) {
    const branch = await Restaurant.findById(membership.branch).select("brandId");
    if (branch && branch.brandId) {
      const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
      recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));
    }
  }

  return membership;
};

/**
 * Fetches membership data with Redis caching.
 */
export const getStaffWithCache = async (userId, branchId) => {
  const cacheKey = getStaffCacheKey(userId, branchId);

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
  } catch (err) {
    console.error("[Redis] Get Error:", err.message);
  }

  const membership = await BranchMembership.findOne({
    user: userId,
    branch: branchId,
    status: "active",
  }).lean();

  if (membership) {
    try {
      await redis.set(cacheKey, JSON.stringify(membership), "EX", 300);
    } catch (err) {
      console.error("[Redis] Set Error:", err.message);
    }
  }

  return membership;
};

/**
 * Invalidate membership cache.
 */
export const clearStaffCache = async (userId, branchId) => {
  const cacheKey = getStaffCacheKey(userId, branchId);
  try {
    await redis.del(cacheKey);
  } catch (err) {
    console.error("[Redis] Delete Error:", err.message);
  }
};


export const listStaffService = async ({ restaurantId, status = "active" }) => {
  // Authorization is now handled by RBAC middleware
  
  const query = { branch: restaurantId };
  if (status !== "all") {
    query.status = status;
  }

  const staffMembers = await BranchMembership.find(query).populate("user", "name email");

  return staffMembers;
};


export const updateStaffService = async ({ staffId, restaurantId, updates }) => {
  // Authorization is now handled by RBAC middleware

  const allowedUpdates = {};
  if (updates.role) allowedUpdates.role = updates.role;
  if (updates.permissions) allowedUpdates.permissions = updates.permissions;
  if (updates.isActive !== undefined) {
    allowedUpdates.status = updates.isActive ? "active" : "suspended";
  }

  const membership = await BranchMembership.findOneAndUpdate(
    { _id: staffId, branch: restaurantId },
    { $set: allowedUpdates },
    { new: true }
  ).populate("user", "name email");

  if (!membership) throw new Error("Staff membership not found");

  // Invalidate cache
  await clearStaffCache(membership.user, restaurantId);

  const branch = await Restaurant.findById(restaurantId).select("brandId");
  if (branch && branch.brandId) {
    const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
    recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));
  }

  return membership;
};


export const deleteStaffService = async ({ staffId, restaurantId }) => {
  // Authorization is now handled by RBAC middleware

  const membership = await BranchMembership.findOneAndUpdate(
    { _id: staffId, branch: restaurantId },
    { $set: { status: "removed" } },
    { new: true }
  );

  if (!membership) throw new Error("Staff membership not found");

  // Invalidate cache
  await clearStaffCache(membership.user, restaurantId);

  const branch = await Restaurant.findById(restaurantId).select("brandId");
  if (branch && branch.brandId) {
    const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
    recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));
  }

  return membership;
};