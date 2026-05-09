import AdminLog from "../../models/adminLog.model.js";
import { emitRestaurantAdminCommand } from "../../kafka/index.js";
import RestaurantReadModel from "../../models/restaurantReadModel.js";

// ============================================================
// READ SIDE — CQRS Local Read Model (NO cross-service DB call)
// ============================================================

export const getAllRestaurantsService = async ({ status } = {}) => {
    const filter = {};
    if (status) filter.status = status;
    const restaurants = await RestaurantReadModel.find(filter).sort({ createdAt: -1 });
    return restaurants;
};

export const approveRestaurantService = async (id, adminId) => {
    const log = await AdminLog.create({ adminId, action: "APPROVE_RESTAURANT", targetId: id });
    console.log(`📝 Admin Action Logged: ${log._id} - ${log.action}`);
    await emitRestaurantAdminCommand("APPROVE_RESTAURANT", { id }, adminId);
    return { success: true, message: "Approval command sent via Kafka" };
};

export const suspendRestaurantService = async (id, adminId) => {
    await AdminLog.create({ adminId, action: "SUSPEND_RESTAURANT", targetId: id });
    await emitRestaurantAdminCommand("SUSPEND_RESTAURANT", { id }, adminId);
    return { success: true, message: "Suspend command sent via Kafka" };
};

export const rejectRestaurantService = async (id, adminId) => {
    await AdminLog.create({ adminId, action: "REJECT_RESTAURANT", targetId: id });
    await emitRestaurantAdminCommand("REJECT_RESTAURANT", { id }, adminId);
    return { success: true, message: "Reject command sent via Kafka" };
};