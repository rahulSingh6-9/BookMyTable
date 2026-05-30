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
// AGGREGATION SERVICES (BFF Pattern)
// ============================================================
import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5002';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5005';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003';

export const getUserDetailsService = async (userId) => {
  try {
    // We can't use admin token directly because other services might expect a user token,
    // or we might need an internal service-to-service auth. 
    // Wait, let's try direct read model + some HTTP or just return read model for now if HTTP fails
    
    // Attempt to fetch full profile from User Service (if it has an admin endpoint)
    // If not, we query the ReadModel and try to get public profile info.
    const user = await UserReadModel.findById(userId).lean();
    if (!user) throw new Error("User not found");

    // Try fetching from User Service internal/admin endpoint if it exists
    let fullDetails = {};
    try {
      // Typically user service exposes /api/users/:id for internal or admin use
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
        headers: { 'x-internal-service': 'admin-service' }
      });
      fullDetails = response.data.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch full user details from User Service", e.message);
    }

    return {
      ...user,
      ...fullDetails
    };
  } catch (error) {
    throw new Error(`Error fetching user details: ${error.message}`);
  }
};

export const getUserActivityService = async (userId) => {
  try {
    // This could fetch login logs, audit logs, etc.
    let activity = [];
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}/activity`, {
        headers: { 'x-internal-service': 'admin-service' }
      });
      activity = response.data.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch user activity from User Service", e.message);
    }
    return activity;
  } catch (error) {
    throw new Error(`Error fetching user activity: ${error.message}`);
  }
};

export const getUserBookingsService = async (userId) => {
  try {
    let bookings = [];
    try {
      // Assuming booking service has an endpoint to get bookings by userId
      const response = await axios.get(`${BOOKING_SERVICE_URL}/api/bookings/user/${userId}`, {
        headers: { 'x-internal-service': 'admin-service' }
      });
      bookings = response.data.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch user bookings from Booking Service", e.message);
    }
    return bookings;
  } catch (error) {
    throw new Error(`Error fetching user bookings: ${error.message}`);
  }
};

export const getUserRestaurantsService = async (userId) => {
  try {
    let restaurants = { owned: [], staff: [] };
    try {
      const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/user/${userId}/affiliations`, {
        headers: { 'x-internal-service': 'admin-service' }
      });
      restaurants = response.data.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch user restaurants from Restaurant Service", e.message);
    }
    return restaurants;
  } catch (error) {
    throw new Error(`Error fetching user restaurants: ${error.message}`);
  }
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
