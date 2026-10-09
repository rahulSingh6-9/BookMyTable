import {
  inviteStaffService,
  generateToken,
} from "./staffInvite.service.js";
import { acceptInviteService, listStaffService, updateStaffService, deleteStaffService } from "./staff.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";
import StaffInvite from "../../models/staffInvite.model.js";
import Restaurant from "../../models/restaurant.model.js";
import User from "../../models/user.model.js";
import Brand from "../../models/brand.model.js";
import notificationService from "../notification/notification.service.js";
import crypto from "crypto";

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
    res.status(err.status || 400).json({ 
      success: false, 
      message: err.message,
      code: err.code || "BAD_REQUEST" 
    });
  }
};

export const revokeInviteController = async (req, res) => {
  try {
    const { inviteId, restaurantId } = req.params;

    const invite = await StaffInvite.findOneAndUpdate(
      { _id: inviteId, branch: restaurantId, status: "pending" },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ success: false, message: "Pending invite not found" });
    }

    createLog({
      action: "STAFF_INVITE_REVOKED",
      performedBy: req.user.id,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { inviteId, email: invite.email },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Invite revoked successfully", data: invite });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const resendInviteController = async (req, res) => {
  try {
    const { inviteId, restaurantId } = req.params;

    const invite = await StaffInvite.findOne({ _id: inviteId, branch: restaurantId, status: "pending" });

    if (!invite) {
      return res.status(404).json({ success: false, message: "Pending invite not found" });
    }

    // Generate new token and expiry
    const { rawToken, tokenHash } = generateToken();
    invite.tokenHash = tokenHash;
    invite.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await invite.save();

    const branch = await Restaurant.findById(restaurantId);
    const inviter = await User.findById(req.user.id).select("name email");
    const brandDoc = branch && branch.brandId ? await Brand.findById(branch.brandId).select("name logo") : null;

    const inviteLink = `${process.env.WEB_URL || process.env.FRONTEND_URL || "http://localhost:8080"}/accept-invite?token=${rawToken}`;

    await notificationService.sendStaffInvite({
      email: invite.email,
      role: invite.role,
      restaurantName: branch?.branchName || branch?.name || brandDoc?.name || "the restaurant",
      brandName: brandDoc?.name || "",
      branchName: branch?.branchName || branch?.name || "",
      inviterName: inviter?.name || "A Team Member",
      inviteLink,
      logo: branch?.logo || brandDoc?.logo,
      coverImage: branch?.coverImage,
    });

    createLog({
      action: "STAFF_INVITE_RESENT",
      performedBy: req.user.id,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { inviteId, email: invite.email },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Invite resent successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const validateInviteController = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await StaffInvite.findOne({ tokenHash }).lean();
    if (!invite) {
      return res.status(404).json({ success: false, message: "Invalid or expired invite" });
    }

    if (invite.status === "accepted") {
      return res.status(400).json({ success: false, message: "This invitation was already accepted" });
    }
    if (invite.status === "expired") {
      return res.status(400).json({ success: false, message: "This invitation has expired" });
    }
    if (invite.status === "cancelled" || invite.status === "rejected") {
      return res.status(400).json({ success: false, message: "This invitation is no longer valid" });
    }
    if (invite.status !== "pending") {
      return res.status(400).json({ success: false, message: "Invalid or expired invite" });
    }

    if (invite.expiresAt < new Date()) {
      await StaffInvite.updateOne({ _id: invite._id }, { $set: { status: "expired" } });
      return res.status(400).json({ success: false, message: "Invitation expired" });
    }

    const branch = await Restaurant.findById(invite.branch).select("name branchName");

    res.status(200).json({
      success: true,
      data: {
        email: invite.email,
        role: invite.role,
        restaurantName: branch?.branchName || branch?.name || "the restaurant",
        restaurantId: branch?._id,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const acceptInviteController = async (req, res) => {
  try {
    const { token, name, password } = req.body;
    const userId = req.user?.id;

    const membership = await acceptInviteService({ token, name, password, userId });

    // 📝 Log Action
    createLog({
      action: "STAFF_ACCEPTED",
      performedBy: membership.user,
      role: membership.role,
      restaurant: membership.branch,
      metadata: { name: name || "Existing User" },
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
    const { status } = req.query;

    if (!restaurantId || restaurantId === "undefined" || restaurantId === "null") {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID" });
    }

    if (status === "pending") {
      const pendingInvites = await StaffInvite.find({ branch: restaurantId, status: "pending" }).lean();
      return res.status(200).json({
        success: true,
        data: pendingInvites,
      });
    }

    const staffMembers = await listStaffService({ restaurantId, status });

    res.status(200).json({
      success: true,
      data: staffMembers,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID format" });
    }
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
