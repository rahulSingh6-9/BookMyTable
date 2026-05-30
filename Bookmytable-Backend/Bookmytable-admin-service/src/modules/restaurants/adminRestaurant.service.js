import AdminLog from "../../models/adminLog.model.js";
import { emitRestaurantAdminCommand } from "../../kafka/index.js";
import BranchReadModel from "../../models/branchReadModel.js";
import BrandReadModel from "../../models/brandReadModel.js";

// ============================================================
// READ SIDE — CQRS Local Read Model (NO cross-service DB call)
// ============================================================

export const getAllRestaurantsService = async ({ status } = {}) => {
    const filter = {};
    if (status) filter.status = status;
    
    // Fetch branches and populate brand info
    const branches = await BranchReadModel.find(filter)
        .populate("brandId")
        .sort({ createdAt: -1 });
        
    return branches;
};

export const approveRestaurantService = async (id, admin) => {
    const log = await AdminLog.create({ adminId: admin.id, action: "APPROVE_RESTAURANT", targetId: id });
    console.log(`📝 Admin Action Logged: ${log._id} - ${log.action}`);
    
    await emitRestaurantAdminCommand({
        action: "APPROVE_RESTAURANT",
        payload: { id },
        adminContext: {
            id: admin.id,
            role: admin.roles?.[0],
            permissions: admin.permissions
        }
    });
    
    return { success: true, message: "Approval command sent via Kafka" };
};

export const suspendRestaurantService = async (id, admin) => {
    await AdminLog.create({ adminId: admin.id, action: "SUSPEND_RESTAURANT", targetId: id });
    
    await emitRestaurantAdminCommand({
        action: "SUSPEND_RESTAURANT",
        payload: { id },
        adminContext: {
            id: admin.id,
            role: admin.roles?.[0],
            permissions: admin.permissions
        }
    });
    
    return { success: true, message: "Suspend command sent via Kafka" };
};

export const rejectRestaurantService = async (id, admin) => {
    await AdminLog.create({ adminId: admin.id, action: "REJECT_RESTAURANT", targetId: id });
    
    await emitRestaurantAdminCommand({
        action: "REJECT_RESTAURANT",
        payload: { id },
        adminContext: {
            id: admin.id,
            role: admin.roles?.[0],
            permissions: admin.permissions
        }
    });
    
    return { success: true, message: "Reject command sent via Kafka" };
};

// ============================================================
// AGGREGATION SERVICES (BFF Pattern)
// ============================================================
import axios from 'axios';

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5005';

export const getRestaurantDetailsService = async (id) => {
    try {
        const branch = await BranchReadModel.findById(id).populate("brandId").lean();
        if (!branch) throw new Error("Restaurant not found");

        let fullDetails = {};
        try {
            const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${id}`, {
                headers: { 'x-internal-service': 'admin-service' }
            });
            fullDetails = response.data.data || response.data;
        } catch (e) {
            console.warn("Failed to fetch full restaurant details from Restaurant Service", e.message);
        }

        return {
            ...branch,
            ...fullDetails
        };
    } catch (error) {
        throw new Error(`Error fetching restaurant details: ${error.message}`);
    }
};

export const getRestaurantMetricsService = async (id) => {
    try {
        let metrics = { bookingsCount: 0, reviewsCount: 0, averageRating: 0 };
        try {
            const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${id}/metrics`, {
                headers: { 'x-internal-service': 'admin-service' }
            });
            metrics = response.data.data || response.data || metrics;
        } catch (e) {
            console.warn("Failed to fetch restaurant metrics", e.message);
        }
        return metrics;
    } catch (error) {
        throw new Error(`Error fetching restaurant metrics: ${error.message}`);
    }
};

export const getRestaurantTablesService = async (id) => {
    try {
        let tables = [];
        try {
            const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${id}/tables`, {
                headers: { 'x-internal-service': 'admin-service' }
            });
            tables = response.data.data || response.data || [];
        } catch (e) {
            console.warn("Failed to fetch restaurant tables", e.message);
        }
        return tables;
    } catch (error) {
        throw new Error(`Error fetching restaurant tables: ${error.message}`);
    }
};

export const getRestaurantStaffService = async (id) => {
    try {
        let staff = [];
        try {
            const response = await axios.get(`${RESTAURANT_SERVICE_URL}/api/restaurants/${id}/staff`, {
                headers: { 'x-internal-service': 'admin-service' }
            });
            staff = response.data.data || response.data || [];
        } catch (e) {
            console.warn("Failed to fetch restaurant staff", e.message);
        }
        return staff;
    } catch (error) {
        throw new Error(`Error fetching restaurant staff: ${error.message}`);
    }
};