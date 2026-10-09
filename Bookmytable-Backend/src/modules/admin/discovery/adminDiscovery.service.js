import Restaurant from "../../../models/restaurant.model.js";
import AdminLog from "../../../models/adminLog.model.js";
import { syncRestaurantToDiscovery } from "../../discovery/discovery.service.js";

export const getDiscoveryRestaurantsService = async () => {
  const branches = await Restaurant.find({ isDeleted: { $ne: true } })
    .populate("brandId", "name logo")
    .sort({ discoveryRanking: -1, averageRating: -1 })
    .lean();
      
  return branches;
};

export const featureRestaurantService = async (id, admin, isFeatured, ranking) => {
  const branch = await Restaurant.findByIdAndUpdate(
    id,
    { $set: { isFeatured, discoveryRanking: ranking || 0 } },
    { new: true }
  );
  if (!branch) throw new Error("Restaurant not found");

  await AdminLog.create({ adminId: admin.id || admin._id, action: "FEATURE_RESTAURANT", targetId: id });
  
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (e) {
    console.error("Discovery sync error:", e.message);
  }
  
  return { success: true, message: "Restaurant featured status updated successfully", data: branch };
};

export const hideRestaurantService = async (id, admin, isHidden) => {
  const branch = await Restaurant.findByIdAndUpdate(
    id,
    { $set: { isHiddenFromDiscovery: isHidden } },
    { new: true }
  );
  if (!branch) throw new Error("Restaurant not found");

  await AdminLog.create({ adminId: admin.id || admin._id, action: "HIDE_RESTAURANT", targetId: id });
  
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (e) {
    console.error("Discovery sync error:", e.message);
  }
  
  return { success: true, message: "Restaurant discovery visibility updated successfully", data: branch };
};
