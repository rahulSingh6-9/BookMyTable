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
