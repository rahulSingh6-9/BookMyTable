import {
  inviteStaffService,
} from "./staffInvite.service.js";
import { acceptInviteService, listStaffService, updateStaffService, deleteStaffService } from "./staff.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";

export const inviteStaffController = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { email, role, permissions } = req.body;

    const invitedBy = req.user.id;

    const invite = await inviteStaffService({
      restaurantId,
      invitedBy,
      email,
      role,
      permissions,
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_INVITED",
      performedBy: invitedBy,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { email, role, permissions },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Invite sent successfully",
      inviteId: invite._id,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const acceptInviteController = async (req, res) => {
  try {
    const { token, name, password } = req.body;

    const membership = await acceptInviteService({ token, name, password });

    // 📝 Log Action
    createLog({
      action: "STAFF_ACCEPTED",
      performedBy: membership.user,
      role: membership.role,
      restaurant: membership.branch,
      metadata: { name },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Staff account activated and membership created",
      membershipId: membership._id,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const listStaffController = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const staffMembers = await listStaffService({ restaurantId });

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
    const { role, permissions, isActive } = req.body;
    const branchId = req.branchId;

    const performedBy = req.user.id;

    const updatedMembership = await updateStaffService({
      staffId,
      restaurantId: branchId,
      updates: { role, permissions, isActive },
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_ROLE_UPDATED",
      performedBy,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { staffId, role, permissions, isActive },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Staff membership updated successfully",
      data: updatedMembership,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteStaffController = async (req, res) => {
  try {
    const { staffId } = req.params;
    const branchId = req.branchId;

    const performedBy = req.user.id;

    const deletedMembership = await deleteStaffService({
      staffId,
      restaurantId: branchId,
    });

    // 📝 Log Action
    createLog({
      action: "STAFF_DEACTIVATED",
      performedBy,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { staffId },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Staff membership removed successfully",
      data: deletedMembership,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};