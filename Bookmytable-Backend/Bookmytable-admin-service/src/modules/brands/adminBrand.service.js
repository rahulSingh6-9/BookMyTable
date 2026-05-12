import BrandReadModel from "../../models/brandReadModel.js";
import BranchReadModel from "../../models/branchReadModel.js";
import AdminLog from "../../models/adminLog.model.js";
import { emitRestaurantAdminCommand } from "../../kafka/index.js";

export const getAllBrandsService = async ({ status } = {}) => {
    const filter = {};
    if (status) filter.status = status;
    return await BrandReadModel.find(filter).sort({ createdAt: -1 });
};

export const getBrandDetailsService = async (id) => {
    const brand = await BrandReadModel.findById(id);
    if (!brand) throw new Error("Brand not found");

    const branches = await BranchReadModel.find({ brandId: id });
    
    return {
        ...brand.toObject(),
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
