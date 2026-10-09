import * as brandService from './brand.service.js';

/**
 * Get all brands owned or managed by the authenticated user.
 */
export const getMyBrands = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User context missing' });
    }
    const brands = await brandService.getBrandsForUser(userId);
    res.status(200).json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all archived brands owned or managed by the authenticated user.
 */
export const getArchivedBrands = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const brands = await brandService.getArchivedBrandsForUser(userId);
    res.status(200).json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and update the Brand Logo
 */
export const updateBrandLogo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo file provided" });
    }

    const logoUrl = await brandService.updateLogo(userId, id, req.file.buffer, globalRoles);
    res.status(200).json({ success: true, message: "Brand logo updated successfully", data: logoUrl });
  } catch (error) {
    if (error.message.includes("Access Denied")) return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Deactivate a brand (temporarily disable operations)
 */
export const deactivateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { reason, password, notifyMembers = true } = req.body;

    if (!reason || !password) {
      return res.status(400).json({ success: false, message: "Reason and password are required for deactivation" });
    }

    const brand = await brandService.deactivate(userId, id, reason, password, notifyMembers, globalRoles);
    res.status(200).json({ success: true, message: "Brand deactivated successfully", data: brand });
  } catch (error) {
    if (error.message === "Invalid password") return res.status(401).json({ success: false, message: error.message });
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Cannot deactivate")) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Archive a brand (soft delete)
 */
export const archiveBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { reason } = req.body;

    const brand = await brandService.archive(userId, id, reason, globalRoles);
    res.status(200).json({ success: true, message: "Brand archived successfully", data: brand });
  } catch (error) {
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Restore an archived brand
 */
export const restoreBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];

    const brand = await brandService.restore(userId, id, globalRoles);
    res.status(200).json({ success: true, message: "Brand restored successfully", data: brand });
  } catch (error) {
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Update Basic Contact Information (Website, Support Email)
 */
export const updateBasicContactInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { website, supportEmail, password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required to update contact information" });
    }

    const brand = await brandService.updateBasicContact(userId, id, { website, supportEmail, password }, globalRoles);
    res.status(200).json({ success: true, message: "Contact information updated successfully", data: brand });
  } catch (error) {
    if (error.message === "Invalid password") return res.status(401).json({ success: false, message: error.message });
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Request Phone OTP for Contact Phone Update
 */
export const requestContactPhoneOTP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { contactPhone, password } = req.body;

    if (!password || !contactPhone) {
      return res.status(400).json({ success: false, message: "Phone and password are required" });
    }

    await brandService.requestPhoneOTP(userId, id, { contactPhone, password }, globalRoles);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    if (error.message === "Invalid password") return res.status(401).json({ success: false, message: error.message });
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Verify Phone OTP and Update Contact Phone
 */
export const verifyContactPhoneOTP = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { contactPhone, otp } = req.body;

    const brand = await brandService.verifyPhoneOTP(userId, id, { contactPhone, otp }, globalRoles);
    res.status(200).json({ success: true, message: "Phone verified and updated", data: brand });
  } catch (error) {
    if (error.message === "Invalid password") return res.status(401).json({ success: false, message: error.message });
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("OTP") || error.message.includes("attempts")) return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Request Contact Email Change
 */
export const requestContactEmailChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { contactEmail, password } = req.body;

    if (!password || !contactEmail) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    await brandService.requestEmailUpdate(userId, id, { contactEmail, password }, globalRoles);
    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    if (error.message === "Invalid password") return res.status(401).json({ success: false, message: error.message });
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    next(error);
  }
};

/**
 * Verify Contact Email Token
 */
export const verifyContactEmailToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const globalRoles = req.user?.roles || [];
    const { token } = req.body;

    const brand = await brandService.verifyEmailToken(userId, id, { token }, globalRoles);
    res.status(200).json({ success: true, message: "Email verified and updated", data: brand });
  } catch (error) {
    if (error.message === "Access Denied") return res.status(403).json({ success: false, message: error.message });
    if (error.message === "Brand not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("verification") || error.message.includes("Token") || error.message.includes("expired")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

