import crypto from "crypto";
import StaffInvite from "../../models/staffInvite.model.js";
import Staff from "../../models/staff.model.js";
import Restaurant from "../../models/restaurant.model.js";
import { authServiceClient } from "./auth.client.js";

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
    role: "staff",
  });

  // 4️⃣ Prevent duplicate staff
  const existingStaff = await Staff.findOne({
    user: user._id,
    restaurant: invite.restaurant,
  });

  if (existingStaff) {
    throw new Error("Already part of this restaurant");
  }

  // 5️⃣ Create staff
  const staff = await Staff.create({
    user: user._id,
    restaurant: invite.restaurant,
    role: invite.role,
    permissions: invite.permissions,
    isActive: true,
    createdBy: invite.invitedBy,
  });

  // 6️⃣ Invalidate potential cache (safety)
  await clearStaffCache(user._id, invite.restaurant);

  // 7️⃣ Update invite
  invite.status = "accepted";

  invite.acceptedAt = new Date();
  await invite.save();

  return staff;
};

/**
 * Fetches staff data with Redis caching.
 * Scalable and production-safe fallback to MongoDB.
 */
export const getStaffWithCache = async (userId, restaurantId) => {
  const cacheKey = getStaffCacheKey(userId, restaurantId);

  try {
    // 1️⃣ Check Redis first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (err) {
    console.error("[Redis] Get Error:", err.message);
    // Fallback to DB on Redis error
  }

  // 2️⃣ Fetch from MongoDB if cache miss
  const staff = await Staff.findOne({
    user: userId,
    restaurant: restaurantId,
    isActive: true,
  }).lean();

  if (staff) {
    try {
      // 3️⃣ Store necessary data only (role, permissions, isActive, restaurantId)
      const cacheData = {
        _id: staff._id,
        user: staff.user,
        role: staff.role,
        permissions: staff.permissions,
        isActive: staff.isActive,
        restaurant: staff.restaurant,
      };

      await redis.set(cacheKey, JSON.stringify(cacheData), "EX", 300); // TTL: 300s
    } catch (err) {
      console.error("[Redis] Set Error:", err.message);
    }
  }

  return staff;
};

/**
 * Invalidate staff cache.
 */
export const clearStaffCache = async (userId, restaurantId) => {
  const cacheKey = getStaffCacheKey(userId, restaurantId);
  try {
    await redis.del(cacheKey);
  } catch (err) {
    console.error("[Redis] Delete Error:", err.message);
  }
};


export const listStaffService = async ({ restaurantId, ownerId }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw new Error("Unauthorized: Only owner can access staff list");
  }

  // 🔥 Populate real user data (name, email) from shared DB using the User stub
  const staffMembers = await Staff.find({ 
    restaurant: restaurantId, 
    isActive: true 
  }).populate("user", "name email");

  return staffMembers;
};


export const updateStaffService = async ({ staffId, restaurantId, ownerId, updates }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw new Error("Unauthorized: Only owner can update staff");
  }

  // updates can only contain role and permissions, etc.
  const allowedUpdates = {};
  if (updates.role) allowedUpdates.role = updates.role;
  if (updates.permissions) allowedUpdates.permissions = updates.permissions;
  if (updates.isActive !== undefined) allowedUpdates.isActive = updates.isActive;

  const staff = await Staff.findOneAndUpdate(
    { _id: staffId, restaurant: restaurantId },
    { $set: allowedUpdates },
    { new: true }
  ).populate("user", "name email");

  if (!staff) throw new Error("Staff member not found");

  // Invalidate cache
  await clearStaffCache(staff.user, restaurantId);

  return staff;
};


export const deleteStaffService = async ({ staffId, restaurantId, ownerId }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== ownerId) {
    throw new Error("Unauthorized: Only owner can delete staff");
  }

  // Soft delete by setting isActive to false
  const staff = await Staff.findOneAndUpdate(
    { _id: staffId, restaurant: restaurantId },
    { $set: { isActive: false } },
    { new: true }
  );

  if (!staff) throw new Error("Staff member not found");

  // Invalidate cache
  await clearStaffCache(staff.user, restaurantId);

  return staff;
};