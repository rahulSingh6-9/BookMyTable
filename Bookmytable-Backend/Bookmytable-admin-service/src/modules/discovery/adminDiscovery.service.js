import BranchReadModel from "../../models/branchReadModel.js";
import AdminLog from "../../models/adminLog.model.js";
import { emitRestaurantAdminCommand } from "../../kafka/index.js";

export const getDiscoveryRestaurantsService = async () => {
    // Return all branches, we will filter on frontend
    const branches = await BranchReadModel.find()
        .populate("brandId", "name")
        .sort({ discoveryRanking: -1, averageRating: -1 })
        .lean();
        
    return branches;
};

export const featureRestaurantService = async (id, admin, isFeatured, ranking) => {
    await AdminLog.create({ adminId: admin.id, action: "FEATURE_RESTAURANT", targetId: id });
    
    await emitRestaurantAdminCommand({
        action: "FEATURE_RESTAURANT",
        payload: { id, isFeatured, discoveryRanking: ranking || 0 },
        adminContext: { id: admin.id }
    });
    
    return { success: true, message: "Feature command sent via Kafka" };
};

export const hideRestaurantService = async (id, admin, isHidden) => {
    await AdminLog.create({ adminId: admin.id, action: "HIDE_RESTAURANT", targetId: id });
    
    await emitRestaurantAdminCommand({
        action: "HIDE_RESTAURANT",
        payload: { id, isHiddenFromDiscovery: isHidden },
        adminContext: { id: admin.id }
    });
    
    return { success: true, message: "Hide command sent via Kafka" };
};
