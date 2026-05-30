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

// ============================================================
// AGGREGATION SERVICES (BFF Pattern)
// ============================================================
import axios from 'axios';

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003';
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:5005';

export const getBrandRestaurantsService = async (brandId) => {
    try {
        let restaurants = [];
        try {
            // Using internal BFF fetch or directly querying RestaurantReadModel
            // Since Admin has a RestaurantReadModel, we can query it!
            const { default: RestaurantReadModel } = await import("../../models/restaurantReadModel.js");
            restaurants = await RestaurantReadModel.find({ brandId }).lean();
        } catch (e) {
            console.warn("Failed to fetch brand restaurants", e.message);
        }
        return restaurants;
    } catch (error) {
        throw new Error(`Error fetching brand restaurants: ${error.message}`);
    }
};

export const getBrandMetricsService = async (brandId) => {
    try {
        const { default: RestaurantReadModel } = await import("../../models/restaurantReadModel.js");
        const restaurants = await RestaurantReadModel.find({ brandId }).lean();
        const restaurantIds = restaurants.map(r => r._id);

        let metrics = {
            totalRestaurants: restaurants.length,
            approvedRestaurants: restaurants.filter(r => r.status === 'approved').length,
            pendingRestaurants: restaurants.filter(r => r.status === 'pending').length,
            suspendedRestaurants: restaurants.filter(r => r.status === 'suspended').length,
            totalStaff: 0,
            totalBookings: 0,
        };

        try {
            const response = await axios.post(`${RESTAURANT_SERVICE_URL}/api/restaurants/metrics/bulk`, { restaurantIds }, {
                headers: { 'x-internal-service': 'admin-service' }
            });
            const bulkMetrics = response.data.data || {};
            metrics.totalStaff = bulkMetrics.totalStaff || 0;
            metrics.totalBookings = bulkMetrics.totalBookings || 0;
        } catch (e) {
            console.warn("Failed to fetch brand metrics from Restaurant Service", e.message);
        }

        return metrics;
    } catch (error) {
        throw new Error(`Error fetching brand metrics: ${error.message}`);
    }
};
