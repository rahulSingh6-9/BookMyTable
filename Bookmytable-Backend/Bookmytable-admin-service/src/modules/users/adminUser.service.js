import AdminLog from "../../models/adminLog.model.js";
import { emitUserAdminCommand } from "../../kafka/index.js";
import UserReadModel from "../../models/userReadModel.js";

// ============================================================
// READ SIDE — CQRS Local Read Model (NO cross-service DB call)
// ============================================================

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

  const users = await UserReadModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await UserReadModel.countDocuments(filter);

  return { users, total };
};

export const banUserService = async (id, admin) => {
  await AdminLog.create({ adminId: admin.id, action: "BAN_USER", targetId: id });
  
  await emitUserAdminCommand({
    action: "BAN_USER",
    payload: { userId: id },
    adminContext: {
      id: admin.id,
      role: admin.roles?.[0],
      permissions: admin.permissions
    }
  });
  
  return { success: true, message: "Ban command sent via Kafka" };
};

export const unbanUserService = async (id, admin) => {
  await AdminLog.create({ adminId: admin.id, action: "UNBAN_USER", targetId: id });
  
  await emitUserAdminCommand({
    action: "UNBAN_USER",
    payload: { userId: id },
    adminContext: {
      id: admin.id,
      role: admin.roles?.[0],
      permissions: admin.permissions
    }
  });
  
  return { success: true, message: "Unban command sent via Kafka" };
};

export const updateUserRoleService = async (id, role, admin) => {
  await AdminLog.create({ adminId: admin.id, action: "UPDATE_USER_ROLE", targetId: id, metadata: { role } });
  
  await emitUserAdminCommand({
    action: "UPDATE_ROLE",
    payload: { userId: id, role },
    adminContext: {
      id: admin.id,
      role: admin.roles?.[0],
      permissions: admin.permissions
    }
  });
  
  return { success: true, message: "Role update command sent via Kafka" };
};

// ============================================================
// READ SIDE — CQRS Local Read Model (NO cross-service DB call)
// ============================================================

export const getUserDetailsService = async (userId) => {
  const user = await UserReadModel.findById(userId).lean();
  if (!user) throw new Error("RESYNC_REQUIRED");
  return user;
};

export const getUserActivityService = async (userId) => {
  const user = await UserReadModel.findById(userId).lean();
  return user?.activityLogs || [];
};

export const getUserBookingsService = async (userId) => {
  // Return just the count/summary instead of full array since we don't store full arrays here
  // The frontend might need adjusting if it was relying on full array, but according to plan 
  // it should rely on real read models metrics.
  const user = await UserReadModel.findById(userId).lean();
  return { total: user?.bookingsCount || 0 };
};

export const getUserRestaurantsService = async (userId) => {
  const user = await UserReadModel.findById(userId).lean();
  return { 
    owned: user?.ownedRestaurants || [], 
    staff: user?.staffAffiliations || [] 
  };
};

export const forceLogoutService = async (userId, admin) => {
  await AdminLog.create({ adminId: admin.id, action: "FORCE_LOGOUT", targetId: userId });
  
  await emitUserAdminCommand({
    action: "FORCE_LOGOUT",
    payload: { userId },
    adminContext: {
      id: admin.id,
      role: admin.roles?.[0],
      permissions: admin.permissions
    }
  });
  
  return { success: true, message: "Force logout command sent via Kafka" };
};
