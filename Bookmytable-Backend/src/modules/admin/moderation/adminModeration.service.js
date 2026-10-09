import Brand from "../../../models/brand.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import User from "../../../models/user.model.js";

export const getApprovalQueueService = async () => {
  // Fetch pending brands
  const pendingBrands = await Brand.find({ status: "pending", isDeleted: { $ne: true } })
    .populate("ownerId", "name email")
    .lean();
  
  // Fetch pending restaurants
  const pendingRestaurants = await Restaurant.find({ status: "pending", isDeleted: { $ne: true } })
    .populate("brandId", "name")
    .populate("ownerId", "name email")
    .lean();
      
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
      owner: restaurant.ownerId,
      createdAt: restaurant.createdAt,
      metadata: {
        city: restaurant.city || restaurant.address?.city || "Unknown"
      }
    });
  });
  
  return queue.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getVerificationsService = async () => {
  const users = await User.find({}).select("-password").limit(100).lean();
  const restaurants = await Restaurant.find({ isDeleted: { $ne: true } }).limit(100).lean();
  
  const verifications = [];
  
  users.forEach(user => {
    verifications.push({
      type: "user",
      id: user._id,
      name: user.name || user.email,
      email: user.email,
      phone: user.phone,
      emailVerified: user.isEmailVerified || false,
      phoneVerified: user.isPhoneVerified || false,
      status: user.isBanned ? "blocked" : user.status || "active",
      createdAt: user.createdAt
    });
  });
  
  restaurants.forEach(restaurant => {
    verifications.push({
      type: "restaurant",
      id: restaurant._id,
      name: restaurant.branchName || restaurant.name,
      emailVerified: restaurant.contact?.isEmailVerified || false,
      phoneVerified: restaurant.contact?.primaryPhone?.isVerified || false,
      status: restaurant.status,
      createdAt: restaurant.createdAt
    });
  });
  
  return verifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
