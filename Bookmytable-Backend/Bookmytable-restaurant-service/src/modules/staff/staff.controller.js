import {
  inviteStaffService,
} from "./staffInvite.service.js";
import { acceptInviteService, listStaffService, updateStaffService, deleteStaffService } from "./staff.service.js";
import { createLog } from "../log/log.service.js";

export const inviteStaffController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { email, role, permissions } = req.body;

    const ownerId = req.headers["x-user-id"];

    const invite = await inviteStaffService({
      restaurantId,
      ownerId,
      email,
      role,
      permissions,
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_INVITED",
      performedBy: ownerId,
      role: req.headers["x-user-role"],
      restaurant: restaurantId,
      metadata: { email, role, permissions },
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Invite sent successfully",
      inviteId: invite._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const acceptInviteController = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const staff = await acceptInviteService({ token, name, password });

    // 📝 Log Action
    createLog({
      action: "STAFF_ACCEPTED",
      performedBy: staff.user,
      role: "staff",
      restaurant: staff.restaurant,
      metadata: { name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: "Staff account activated",
      staffId: staff._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listStaffController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.headers["x-user-id"];

    const staffMembers = await listStaffService({ restaurantId, ownerId });

    res.status(200).json({
      success: true,
      data: staffMembers,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateStaffController = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { restaurantId, role, permissions, isActive } = req.body;

    const ownerId = req.headers["x-user-id"];

    const updatedStaff = await updateStaffService({
      staffId,
      restaurantId,
      ownerId,
      updates: { role, permissions, isActive },
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_ROLE_UPDATED",
      performedBy: ownerId,
      role: req.headers["x-user-role"],
      restaurant: restaurantId,
      metadata: { staffId, role, permissions, isActive },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: updatedStaff,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteStaffController = async (req, res) => {
  try {
    const { staffId } = req.params;
    const restaurantId = req.body.restaurantId || req.query.restaurantId;

    const ownerId = req.headers["x-user-id"];

    const deletedStaff = await deleteStaffService({
      staffId,
      restaurantId,
      ownerId,
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_DEACTIVATED",
      performedBy: ownerId,
      role: req.headers["x-user-role"],
      restaurant: restaurantId,
      metadata: { staffId },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Staff removed successfully",
      data: deletedStaff,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};