import BrandReadModel from "../../models/brandReadModel.js";
import BranchReadModel from "../../models/branchReadModel.js";
import AdminLog from "../../models/adminLog.model.js";
import { emitRestaurantAdminCommand } from "../../kafka/index.js";

export const getAllBrandsService = async ({ status } = {}) => {
    const filter = {};
    if (status) filter.status = status;
    return await BrandReadModel.find(filter)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });
};

export const getBrandDetailsService = async (id) => {
    const brand = await BrandReadModel.findById(id)
      .populate("ownerId", "name email")
      .lean();
    if (!brand) throw new Error("RESYNC_REQUIRED");

    const branches = await BranchReadModel.find({ brandId: id });
    
    return {
        ...brand,
        branches
    };
};

export const approveBrandService = async (id, adminId) => {
    await AdminLog.create({ adminId, action: "APPROVE_BRAND", targetId: id });
    await emitRestaurantAdminCommand("APPROVE_BRAND", { id }, adminId);
    
    // Optimistic update of read model
    await BrandReadModel.findByIdAndUpdate(id, { status: "approved", isVerified: true });
    
    return { success: true };
};

export const suspendBrandService = async (id, adminId) => {
    await AdminLog.create({ adminId, action: "SUSPEND_BRAND", targetId: id });
    await emitRestaurantAdminCommand("SUSPEND_BRAND", { id }, adminId);
    
    await BrandReadModel.findByIdAndUpdate(id, { status: "suspended" });
    
    return { success: true };
};

export const rejectBrandService = async (id, adminId) => {
    await AdminLog.create({ adminId, action: "REJECT_BRAND", targetId: id });
    await emitRestaurantAdminCommand("REJECT_BRAND", { id }, adminId);
    
    await BrandReadModel.findByIdAndUpdate(id, { status: "rejected" });
    
    return { success: true };
};

export const getBrandRestaurantsService = async (brandId) => {
    return await BranchReadModel.find({ brandId }).lean();
};

export const getBrandMetricsService = async (brandId) => {
    const brand = await BrandReadModel.findById(brandId).lean();
    
    // Fallbacks since we natively store metrics on the brand read model now
    return {
        totalRestaurants: brand?.totalBranches || 0,
        approvedRestaurants: brand?.activeBranches || 0,
        pendingRestaurants: 0,
        suspendedRestaurants: brand?.deactivatedBranches || 0,
        totalStaff: brand?.staffCount || 0,
        totalBookings: brand?.bookingsCount || 0,
    };
};
