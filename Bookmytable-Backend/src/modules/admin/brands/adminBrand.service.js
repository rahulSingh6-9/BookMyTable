import Brand from "../../../models/brand.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import BranchMembership from "../../../models/branchmemberships.model.js";
import Booking from "../../../models/booking.model.js";
import AdminLog from "../../../models/adminLog.model.js";
import { syncRestaurantToDiscovery } from "../../discovery/discovery.service.js";

export const getAllBrandsService = async ({ status } = {}) => {
  const filter = { isDeleted: { $ne: true } };
  if (status) filter.status = status;
  return await Brand.find(filter)
    .populate("ownerId", "name email")
    .sort({ createdAt: -1 });
};

export const getBrandDetailsService = async (id) => {
  const brand = await Brand.findById(id)
    .populate("ownerId", "name email")
    .lean();
  if (!brand) throw new Error("Brand not found");

  const branches = await Restaurant.find({ brandId: id, isDeleted: { $ne: true } }).lean();
  
  return {
    ...brand,
    branches
  };
};

export const approveBrandService = async (id, adminId) => {
  const brand = await Brand.findByIdAndUpdate(id, { status: "approved", isVerified: true, isActive: true }, { new: true });
  if (!brand) throw new Error("Brand not found");

  await AdminLog.create({ adminId, action: "APPROVE_BRAND", targetId: id });
  
  const branches = await Restaurant.find({ brandId: id, isDeleted: { $ne: true } }).select("_id");
  for (const b of branches) {
    try { await syncRestaurantToDiscovery(b._id); } catch (e) {}
  }
  
  return { success: true, message: "Brand approved successfully", data: brand };
};

export const suspendBrandService = async (id, adminId) => {
  const brand = await Brand.findByIdAndUpdate(id, { status: "suspended", isActive: false }, { new: true });
  if (!brand) throw new Error("Brand not found");

  await AdminLog.create({ adminId, action: "SUSPEND_BRAND", targetId: id });
  
  const branches = await Restaurant.find({ brandId: id }).select("_id");
  for (const b of branches) {
    try { await syncRestaurantToDiscovery(b._id); } catch (e) {}
  }
  
  return { success: true, message: "Brand suspended successfully", data: brand };
};

export const rejectBrandService = async (id, adminId) => {
  const brand = await Brand.findByIdAndUpdate(id, { status: "rejected", isActive: false }, { new: true });
  if (!brand) throw new Error("Brand not found");

  await AdminLog.create({ adminId, action: "REJECT_BRAND", targetId: id });
  
  const branches = await Restaurant.find({ brandId: id }).select("_id");
  for (const b of branches) {
    try { await syncRestaurantToDiscovery(b._id); } catch (e) {}
  }
  
  return { success: true, message: "Brand rejected successfully", data: brand };
};

export const getBrandRestaurantsService = async (brandId) => {
  return await Restaurant.find({ brandId, isDeleted: { $ne: true } }).lean();
};

export const getBrandMetricsService = async (brandId) => {
  const totalRestaurants = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true } });
  const approvedRestaurants = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true }, status: "approved", isActive: true });
  const pendingRestaurants = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true }, status: "pending" });
  const suspendedRestaurants = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true }, status: "suspended" });
  const totalStaff = await BranchMembership.countDocuments({ brand: brandId, status: "active" });
  
  const branchIds = await Restaurant.find({ brandId }).distinct("_id");
  const totalBookings = await Booking.countDocuments({ restaurant: { $in: branchIds } });
  
  return {
    totalRestaurants,
    approvedRestaurants,
    pendingRestaurants,
    suspendedRestaurants,
    totalStaff,
    totalBookings,
  };
};
