import AdminLog from "../../../models/adminLog.model.js";
import Restaurant from "../../../models/restaurant.model.js";
import Brand from "../../../models/brand.model.js";
import Table from "../../../models/table.model.js";
import BranchMembership from "../../../models/branchmemberships.model.js";
import Booking from "../../../models/booking.model.js";
import { syncRestaurantToDiscovery } from "../../discovery/discovery.service.js";
import notificationService from "../../notification/notification.service.js";

export const getAllRestaurantsService = async ({ status } = {}) => {
  const filter = { isDeleted: { $ne: true } };
  if (status) filter.status = status;
  
  const branches = await Restaurant.find(filter)
    .populate("brandId")
    .populate("ownerId", "name email")
    .sort({ createdAt: -1 });
      
  return branches;
};

export const approveRestaurantService = async (id, admin) => {
  const branch = await Restaurant.findByIdAndUpdate(
    id,
    { 
      $set: { 
        status: "approved", 
        isActive: true, 
        approvedAt: new Date(),
        approvedBy: admin.id || admin._id
      } 
    },
    { new: true }
  ).populate("ownerId", "name email");

  if (!branch) throw new Error("Restaurant not found");

  await AdminLog.create({ 
    adminId: admin.id || admin._id, 
    action: "APPROVE_RESTAURANT", 
    targetId: id 
  });
  
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (e) {
    console.error("Discovery sync error on approve:", e.message);
  }

  // Send status email notification
  const recipientEmail = branch.contact?.email || branch.ownerId?.email;
  if (recipientEmail) {
    notificationService.sendRestaurantStatusNotification({
      email: recipientEmail,
      restaurantName: branch.branchName || branch.name,
      status: "approved"
    }).catch(err => console.error("Notification error:", err));
  }
  
  return { success: true, message: "Restaurant approved successfully", data: branch };
};

export const suspendRestaurantService = async (id, admin, reason) => {
  const branch = await Restaurant.findByIdAndUpdate(
    id,
    { 
      $set: { 
        status: "suspended", 
        isActive: false, 
        deactivateReason: reason || "Suspended by Platform Admin" 
      } 
    },
    { new: true }
  ).populate("ownerId", "name email");

  if (!branch) throw new Error("Restaurant not found");

  await AdminLog.create({ 
    adminId: admin.id || admin._id, 
    action: "SUSPEND_RESTAURANT", 
    targetId: id,
    metadata: { reason }
  });
  
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (e) {
    console.error("Discovery sync error on suspend:", e.message);
  }

  const recipientEmail = branch.contact?.email || branch.ownerId?.email;
  if (recipientEmail) {
    notificationService.sendRestaurantStatusNotification({
      email: recipientEmail,
      restaurantName: branch.branchName || branch.name,
      status: "suspended",
      reason
    }).catch(err => console.error("Notification error:", err));
  }
  
  return { success: true, message: "Restaurant suspended successfully", data: branch };
};

export const rejectRestaurantService = async (id, admin, reason) => {
  const branch = await Restaurant.findByIdAndUpdate(
    id,
    { 
      $set: { 
        status: "rejected", 
        isActive: false, 
        rejectedAt: new Date(),
        rejectionReason: reason || "Rejected by Platform Admin" 
      } 
    },
    { new: true }
  ).populate("ownerId", "name email");

  if (!branch) throw new Error("Restaurant not found");

  await AdminLog.create({ 
    adminId: admin.id || admin._id, 
    action: "REJECT_RESTAURANT", 
    targetId: id,
    metadata: { reason }
  });
  
  try {
    await syncRestaurantToDiscovery(branch._id);
  } catch (e) {
    console.error("Discovery sync error on reject:", e.message);
  }

  const recipientEmail = branch.contact?.email || branch.ownerId?.email;
  if (recipientEmail) {
    notificationService.sendRestaurantStatusNotification({
      email: recipientEmail,
      restaurantName: branch.branchName || branch.name,
      status: "rejected",
      reason
    }).catch(err => console.error("Notification error:", err));
  }
  
  return { success: true, message: "Restaurant rejected successfully", data: branch };
};

export const getRestaurantDetailsService = async (id) => {
  const branch = await Restaurant.findById(id)
    .populate("brandId")
    .populate("ownerId", "name email phone")
    .lean();
  if (!branch) throw new Error("Restaurant not found");
  return branch;
};

export const getRestaurantMetricsService = async (id) => {
  const bookingsCount = await Booking.countDocuments({ restaurant: id });
  const branch = await Restaurant.findById(id).select("averageRating totalReviews").lean();
  return { 
    bookingsCount, 
    reviewsCount: branch?.totalReviews || 0, 
    averageRating: branch?.averageRating || 0 
  };
};

export const getRestaurantTablesService = async (id) => {
  const tables = await Table.find({ branch: id, isDeleted: { $ne: true } }).lean();
  return { total: tables.length, tables };
};

export const getRestaurantStaffService = async (id) => {
  const staff = await BranchMembership.find({ branch: id, status: "active" })
    .populate("user", "name email")
    .lean();
  return { total: staff.length, staff };
};