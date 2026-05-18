import * as workspaceService from "./businessWorkspace.service.js";
import Restaurant from "../../models/restaurant.model.js";
import { ROLES } from "../../config/roles.js";

/**
 * GET branding details
 */
export const getBranding = async (req, res, next) => {
  try {
    const { branchId } = req;
    const branding = await workspaceService.getBrandingDetails(branchId, req.user?.id);
    
    res.status(200).json({
      success: true,
      message: "Branding details fetched successfully",
      data: branding,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch branding details",
    });
  }
};

/**
 * PUT branding details
 */
export const updateBranding = async (req, res, next) => {
  try {
    const { branchId } = req;
    const userId = req.user.id;

    // Check Role Restrictions: only owner, co_owner, and manager can manage branding
    if (req.activeRole !== ROLES.OWNER && req.activeRole !== ROLES.CO_OWNER && req.activeRole !== ROLES.MANAGER) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Branding changes are restricted to Owner, Co-Owner, or Manager roles.",
      });
    }

    const updatedBranding = await workspaceService.updateBrandingDetails(branchId, req.body, userId);

    res.status(200).json({
      success: true,
      message: "Branding details updated successfully",
      data: updatedBranding,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update branding details",
    });
  }
};

/**
 * GET verification status
 */
export const getVerification = async (req, res, next) => {
  try {
    const { branchId } = req;

    // Role Restriction: owner, co_owner, or admin only
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");

    if (req.activeRole !== ROLES.OWNER && req.activeRole !== ROLES.CO_OWNER && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Verification management is restricted to Owners and Platform Admins.",
      });
    }

    const verificationDetails = await workspaceService.getVerificationDetails(branchId, req.user?.id);

    res.status(200).json({
      success: true,
      message: "Verification details fetched successfully",
      data: verificationDetails,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to fetch verification details",
    });
  }
};

/**
 * POST confirm phone OTP verification on the active branch
 */
export const confirmPhone = async (req, res, next) => {
  try {
    const { branchId } = req;

    // Role Restriction: owner, co_owner, or admin only
    const globalRoles = req.user?.roles || [];
    const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");

    if (req.activeRole !== ROLES.OWNER && req.activeRole !== ROLES.CO_OWNER && !isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Phone verification confirms are restricted to Owners.",
      });
    }

    const branch = await Restaurant.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Restaurant branch not found",
      });
    }

    if (!branch.contact) branch.contact = {};
    if (!branch.contact.primaryPhone) branch.contact.primaryPhone = {};

    branch.contact.primaryPhone.isVerified = true;
    await branch.save();

    res.status(200).json({
      success: true,
      message: "Phone verification status confirmed and updated in branch info",
      data: branch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm phone verification status",
    });
  }
};
