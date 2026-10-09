import crypto from "crypto";
import bcrypt from "bcryptjs";
import StaffInvite from "../../models/staffInvite.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import Restaurant from "../../models/restaurant.model.js";
import User from "../../models/user.model.js";
import redis from "../../config/redis.js";
import { getStaffCacheKey } from "../../utils/cacheKeys.js";
import { recalculateUsage } from "../subscriptions/subscription.service.js";

export const acceptInviteService = async ({ token, name, password, userId }) => {
  // 1️⃣ Hash token
  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2️⃣ Find invite
  const invite = await StaffInvite.findOne({ tokenHash });

  if (!invite) throw new Error("Invalid or expired invite");

  if (invite.status === "accepted") {
    throw new Error("This invitation was already accepted");
  }
  if (invite.status === "expired") {
    throw new Error("This invitation has expired");
  }
  if (invite.status === "cancelled" || invite.status === "rejected") {
    throw new Error("This invitation is no longer valid");
  }
  if (invite.status !== "pending") {
    throw new Error("Invalid or expired invite");
  }

  if (invite.expiresAt < new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new Error("Invite expired");
  }

  // 3️⃣ Sync or Fetch User
  let user;
  if (userId) {
    user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error("This invitation belongs to another email address");
    }
  } else {
    user = await User.findOne({ email: invite.email.toLowerCase() });
    if (!user) {
      if (!password) {
        throw new Error("Password is required for new accounts");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email: invite.email.toLowerCase(),
        name: name || "Staff Member",
        password: hashedPassword,
        roles: ["customer"],
        isEmailVerified: true,
      });
    }
  }

  // 4️⃣ Prevent duplicate membership
  const existingMembership = await BranchMembership.findOne({
    user: user._id,
    branch: invite.branch,
  });

  if (existingMembership) {
    throw new Error("Already a member of this branch");
  }

  // 5️⃣ Create Branch Membership
  const membership = await BranchMembership.create({
    user: user._id,
    branch: invite.branch,
    brand: invite.brand,
    role: invite.role,
    permissions: Array.isArray(invite.permissions) 
      ? invite.permissions.map(p => typeof p === 'string' ? { action: p, scope: 'branch' } : p)
      : [],
    status: "active",
    invitedBy: invite.invitedBy,
    joinedAt: new Date(),
  });

  // 6️⃣ Invalidate potential cache
  await clearStaffCache(user._id, invite.branch);

  // 7️⃣ Update invite
  invite.status = "accepted";
  invite.acceptedAt = new Date();
  await invite.save();

  if (membership.branch) {
    const branch = await Restaurant.findById(membership.branch).select("brandId");
    if (branch && branch.brandId) {
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
  const query = { branch: restaurantId };
  if (status !== "all") {
    query.status = status;
  }

  const staffMembers = await BranchMembership.find(query).populate("user", "name email");

  return staffMembers;
};

export const updateStaffService = async ({ staffId, restaurantId, updates }) => {
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
  await clearStaffCache(membership.user?._id || membership.user, restaurantId);

  const branch = await Restaurant.findById(restaurantId).select("brandId");
  if (branch && branch.brandId) {
    recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));
  }

  return membership;
};

export const deleteStaffService = async ({ staffId, restaurantId }) => {
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
    recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));
  }

  return membership;
};
