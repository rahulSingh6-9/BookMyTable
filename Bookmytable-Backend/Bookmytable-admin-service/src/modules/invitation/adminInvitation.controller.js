import crypto from "crypto";
import AdminInvitation from "../../models/adminInvitation.model.js";
import Admin from "../../models/admin.model.js";
import UserReadModel from "../../models/userReadModel.js";
import { emitAdminInvitationEvent, emitUserRoleUpdate } from "../../kafka/producers/adminInvitation.producer.js";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "../../config/permissions.js";

// Helper to generate tokens
const generateToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

// Create a new invitation
export const createInvitation = async (req, res) => {
  try {
    const { email, role, customPermissions, brandAccess, branchAccess, notes } = req.body;
    const invitedBy = req.user.id;

    if (!Object.values(ROLES).includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    // Check if an active invitation already exists for this email and role
    const existingInvite = await AdminInvitation.findOne({
      email: email.toLowerCase(),
      role,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: "A pending invitation already exists for this user and role.",
      });
    }

    // Check if the user is already an admin with this role
    const existingUser = await UserReadModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const existingAdmin = await Admin.findOne({ userId: existingUser._id });
      if (existingAdmin && existingAdmin.roles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "User is already an admin with this role.",
        });
      }
    }

    const { token, tokenHash } = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const invitation = await AdminInvitation.create({
      email,
      role,
      customPermissions,
      brandAccess,
      branchAccess,
      invitedBy,
      tokenHash,
      expiresAt,
      metadata: { notes },
    });

    // Resolve inviter name for the email
    const inviter = await UserReadModel.findById(invitedBy).lean();
    const inviterName = inviter ? inviter.name : "An Admin";

    // Create the invite link
    // E.g., http://localhost:8081/admin/join?token=...
    const inviteLink = `${process.env.ADMIN_FRONTEND_URL || "http://localhost:8081"}/admin/join?token=${token}`;

    // Emit Kafka event for notification service
    await emitAdminInvitationEvent("invited", {
      invitationId: invitation._id,
      email: invitation.email,
      role: invitation.role,
      customPermissions: invitation.customPermissions,
      inviterName,
      inviteLink,
      expiresAt: invitation.expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invitation,
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all invitations (with pagination)
export const getInvitations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const invitations = await AdminInvitation.find(filter)
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AdminInvitation.countDocuments(filter);

    // Compute statistics
    const statsArray = await AdminInvitation.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const stats = statsArray.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { pending: 0, accepted: 0, expired: 0, revoked: 0, delivery_failed: 0, total: await AdminInvitation.countDocuments() });

    res.status(200).json({
      success: true,
      data: invitations,
      stats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Validate a token
export const validateToken = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invitation = await AdminInvitation.findOne({ tokenHash })
      .populate("invitedBy", "name")
      .lean();

    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Invitation is already ${invitation.status}`,
        status: invitation.status 
      });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      await emitAdminInvitationEvent("expired", {
        invitationId: invitation._id,
        email: invitation.email,
        ipAddress: req.ip || req.headers["x-forwarded-for"]
      });

      return res.status(400).json({ 
        success: false, 
        message: "Invitation has expired",
        status: "expired" 
      });
    }

    await emitAdminInvitationEvent("viewed", {
      invitationId: invitation._id,
      email: invitation.email,
      ipAddress: req.ip || req.headers["x-forwarded-for"]
    });

    res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        invitedBy: invitation.invitedBy ? invitation.invitedBy.name : "Admin",
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error validating token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Accept an invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const invitation = await AdminInvitation.findOne({ tokenHash, status: "pending" });

    if (!invitation) {
      await emitAdminInvitationEvent("failed", {
        reason: "Invalid or already processed invitation",
        ipAddress: req.ip || req.headers["x-forwarded-for"]
      });
      return res.status(404).json({ success: false, message: "Invalid or already processed invitation" });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = "expired";
      await invitation.save();
      
      await emitAdminInvitationEvent("expired", {
        invitationId: invitation._id,
        email: invitation.email,
        ipAddress: req.ip || req.headers["x-forwarded-for"]
      });

      return res.status(400).json({ success: false, message: "Invitation has expired" });
    }

    const user = await UserReadModel.findById(userId);
    if (!user) {
      await emitAdminInvitationEvent("failed", {
        invitationId: invitation._id,
        reason: "User not found",
        email: invitation.email
      });
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify email matches (optional depending on strictness, but good practice)
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      await emitAdminInvitationEvent("failed", {
        invitationId: invitation._id,
        reason: "Email mismatch during acceptance",
        email: user.email
      });
      return res.status(403).json({ success: false, message: "This invitation was sent to a different email address." });
    }

    // Create or update admin
    let admin = await Admin.findOne({ userId });
    
    if (admin) {
      // Append roles if not present
      if (!admin.roles.includes(invitation.role)) {
        admin.roles.push(invitation.role);
      }
      
      // Add custom permissions if any
      if (invitation.customPermissions && invitation.customPermissions.length > 0) {
        admin.customPermissions = [...new Set([...(admin.customPermissions || []), ...invitation.customPermissions])];
      }

      await admin.save();
    } else {
      admin = await Admin.create({
        userId,
        email: user.email,
        name: user.name,
        roles: [invitation.role],
        customPermissions: invitation.customPermissions,
        status: "active"
      });
    }

    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Emit event
    await emitAdminInvitationEvent("joined", {
      userId,
      adminId: admin._id,
      email: user.email,
      role: invitation.role,
      joinedAt: new Date()
    });

    // ✨ Send command to User Service to grant the role in the core system!
    await emitUserRoleUpdate(userId, invitation.role, userId);

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Revoke an invitation
export const revokeInvitation = async (req, res) => {
  try {
    const { id } = req.params;

    const invitation = await AdminInvitation.findById(id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({ success: false, message: `Cannot revoke a ${invitation.status} invitation` });
    }

    invitation.status = "revoked";
    invitation.revokedAt = new Date();
    await invitation.save();

    // Emit revoke event
    await emitAdminInvitationEvent("revoked", {
      invitationId: invitation._id,
      email: invitation.email,
      adminId: req.user.id
    });

    res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Resend an invitation
export const resendInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitedBy = req.user.id;

    const invitation = await AdminInvitation.findById(id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: "Invitation not found" });
    }

    if (invitation.status === "accepted") {
      return res.status(400).json({ success: false, message: "Cannot resend an accepted invitation" });
    }

    const { token, tokenHash } = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    invitation.tokenHash = tokenHash;
    invitation.expiresAt = expiresAt;
    invitation.status = "pending";
    invitation.invitedBy = invitedBy; // Update inviter
    await invitation.save();

    const inviter = await UserReadModel.findById(invitedBy).lean();
    const inviterName = inviter ? inviter.name : "An Admin";
    const inviteLink = `${process.env.ADMIN_FRONTEND_URL || "http://localhost:8081"}/admin/join?token=${token}`;

    await emitAdminInvitationEvent("resent", {
      invitationId: invitation._id,
      email: invitation.email,
      role: invitation.role,
      customPermissions: invitation.customPermissions,
      inviterName,
      inviteLink,
      expiresAt: invitation.expiresAt,
    });

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    console.error("Error resending invitation:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Export RBAC Config
export const getRBACConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        roles: ROLES,
        permissions: PERMISSIONS,
        rolePermissions: ROLE_PERMISSIONS
      }
    });
  } catch (error) {
    console.error("Error fetching RBAC config:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
