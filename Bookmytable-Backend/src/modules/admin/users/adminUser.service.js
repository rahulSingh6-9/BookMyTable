import AdminLog from "../../../models/adminLog.model.js";
import User from "../../../models/user.model.js";
import Booking from "../../../models/booking.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import BranchMembership from "../../../models/branchmemberships.model.js";
import Log from "../../../models/log.model.js";
import redis from "../../../config/redis.js";

export const exportUsersService = async ({ page = 1, limit = 10, search, status, role }) => {
  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (role) {
    filter.roles = role;
  }

  const users = await User.find(filter)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(filter);

  return { users, total };
};

export const banUserService = async (id, admin) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { status: "banned", isBanned: true } },
    { new: true }
  ).select("-password");

  if (!user) throw new Error("User not found");

  await AdminLog.create({ adminId: admin.id || admin._id, action: "BAN_USER", targetId: id });
  
  return { success: true, message: "User banned successfully", user };
};

export const unbanUserService = async (id, admin) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { status: "active", isBanned: false } },
    { new: true }
  ).select("-password");

  if (!user) throw new Error("User not found");

  await AdminLog.create({ adminId: admin.id || admin._id, action: "UNBAN_USER", targetId: id });
  
  return { success: true, message: "User unbanned successfully", user };
};

export const updateUserRoleService = async (id, role, admin) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { roles: [role] } },
    { new: true }
  ).select("-password");

  if (!user) throw new Error("User not found");

  await AdminLog.create({ adminId: admin.id || admin._id, action: "UPDATE_USER_ROLE", targetId: id, metadata: { role } });
  
  return { success: true, message: "User role updated successfully", user };
};

export const getUserDetailsService = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) throw new Error("User not found");

  const bookingsCount = await Booking.countDocuments({ user: userId });
  const ownedRestaurants = await Restaurant.find({ ownerId: userId }).select("branchName name slug status").lean();
  const memberships = await BranchMembership.find({ user: userId, status: "active" })
    .populate("branch", "branchName name slug status")
    .lean();

  return {
    ...user,
    bookingsCount,
    ownedRestaurants,
    staffAffiliations: memberships.map(m => ({
      branch: m.branch,
      role: m.role,
      joinedAt: m.joinedAt
    }))
  };
};

export const getUserActivityService = async (userId) => {
  const logs = await Log.find({ performedBy: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return logs;
};

export const getUserBookingsService = async (userId) => {
  const bookings = await Booking.find({ user: userId })
    .populate("restaurant", "branchName name")
    .sort({ bookingDate: -1, createdAt: -1 })
    .lean();
  return { total: bookings.length, bookings };
};

export const getUserRestaurantsService = async (userId) => {
  const owned = await Restaurant.find({ ownerId: userId }).lean();
  const memberships = await BranchMembership.find({ user: userId, status: "active" })
    .populate("branch")
    .lean();

  return { 
    owned, 
    staff: memberships.map(m => ({
      branch: m.branch,
      role: m.role,
      joinedAt: m.joinedAt
    }))
  };
};

export const forceLogoutService = async (userId, admin) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  
  try {
    await redis.del(`auth:session:${userId}`);
    await redis.del(`user:cache:${userId}`);
  } catch (e) {}

  await AdminLog.create({ adminId: admin.id || admin._id, action: "FORCE_LOGOUT", targetId: userId });
  
  return { success: true, message: "User forced to log out successfully" };
};
