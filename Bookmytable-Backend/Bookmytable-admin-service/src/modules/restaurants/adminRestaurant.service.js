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

export const getRestaurantDetailsService = async (id) => {
    const branch = await BranchReadModel.findById(id).populate("brandId").lean();
    if (!branch) throw new Error("RESYNC_REQUIRED");
    return branch;
};

export const getRestaurantMetricsService = async (id) => {
    const branch = await BranchReadModel.findById(id).lean();
    return { 
        bookingsCount: branch?.bookingsCount || 0, 
        reviewsCount: branch?.totalReviews || 0, 
        averageRating: branch?.averageRating || 0 
    };
};

export const getRestaurantTablesService = async (id) => {
    const branch = await BranchReadModel.findById(id).lean();
    // Return summary since we don't store the full tables array in CQRS
    return { total: branch?.tablesCount || 0 };
};

export const getRestaurantStaffService = async (id) => {
    const branch = await BranchReadModel.findById(id).lean();
    return { total: branch?.staffCount || 0 };
};