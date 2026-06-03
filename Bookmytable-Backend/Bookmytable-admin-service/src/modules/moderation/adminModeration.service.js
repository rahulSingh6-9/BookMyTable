import BrandReadModel from "../../models/brandReadModel.js";
import BranchReadModel from "../../models/branchReadModel.js";
import UserReadModel from "../../models/userReadModel.js";

export const getApprovalQueueService = async () => {
    // Fetch pending brands
    const pendingBrands = await BrandReadModel.find({ status: "pending" })
        .populate("ownerId", "name email")
        .lean();
    
    // Fetch pending restaurants
    const pendingRestaurants = await BranchReadModel.find({ status: "pending" })
        .populate("brandId", "name")
        .lean();
        
    // Format into a unified queue
    const queue = [];
    
    pendingBrands.forEach(brand => {
        queue.push({
            type: "brand",
            id: brand._id,
            name: brand.name,
            status: brand.status,
            owner: brand.ownerId,
            createdAt: brand.createdAt,
            metadata: {
                totalBranches: brand.totalBranches || 0
            }
        });
    });
    
    pendingRestaurants.forEach(restaurant => {
        queue.push({
            type: "restaurant",
            id: restaurant._id,
            name: restaurant.branchName || restaurant.name,
            status: restaurant.status,
            brand: restaurant.brandId,
            createdAt: restaurant.createdAt,
            metadata: {
                city: restaurant.city || restaurant.address?.city || "Unknown"
            }
        });
    });
    
    // Sort by createdAt desc
    return queue.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getVerificationsService = async () => {
    // Fetch all users and restaurants for verification center
    // In a real production system with millions of rows, we'd paginate this and filter in DB.
    // Since this is CQRS and we want an aggregated list, we'll fetch and map.
    
    const users = await UserReadModel.find({}).lean();
    const restaurants = await BranchReadModel.find({}).lean();
    
    const verifications = [];
    
    users.forEach(user => {
        verifications.push({
            type: "user",
            id: user._id,
            name: user.name || user.email,
            email: user.email,
            phone: user.phone,
            emailVerified: user.emailVerified || false,
            phoneVerified: user.phoneVerified || false,
            status: user.isBlocked ? "blocked" : "active",
            createdAt: user.createdAt
        });
    });
    
    restaurants.forEach(restaurant => {
        verifications.push({
            type: "restaurant",
            id: restaurant._id,
            name: restaurant.branchName || restaurant.name,
            emailVerified: restaurant.emailVerified || false,
            phoneVerified: restaurant.phoneVerified || false,
            status: restaurant.status,
            createdAt: restaurant.createdAt
        });
    });
    
    return verifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
