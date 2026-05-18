import { 
  getCurrentUserService, 
  updateUserService, 
  changePasswordService,
  requestPhoneChangeService,
  verifyPhoneOtpService,
  resendPhoneOtpService,
  requestEmailChangeService,
  verifyEmailTokenService,
  deactivateAccountService
} from "./user.service.js";

/**
 * =========================================================
 * FETCH CURRENT USER PROFILE
 * =========================================================
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUserService(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * PATCH-STYLE PARTIAL PROFILE UPDATE
 * =========================================================
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, avatar, phone } = req.body;
    const userId = req.user.id;
    
    const updateData = {};
    
    // 👤 Partial Name Update
    if (fullName !== undefined) {
      updateData["name"] = fullName.trim();
      updateData["profile.fullName"] = fullName.trim();
    }
    
    // 🖼️ Partial Avatar Update (JSON/String/Null)
    if (avatar !== undefined) {
      updateData["avatar"] = avatar || "";
      updateData["profile.avatar"] = avatar || "";
    }
    
    // 📞 Partial Phone Update
    if (phone !== undefined) {
      if (typeof phone === "object") {
        if (phone.number !== undefined) updateData["phone.number"] = phone.number;
        if (phone.e164 !== undefined) updateData["phone.e164"] = phone.e164;
      } else {
        updateData["phone.number"] = phone;
        updateData["phone.e164"] = phone;
      }
    }
    
    console.log("📝 PATCH Profile Request:", { userId, updateData });
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update provided"
      });
    }
    
    const updatedUser = await updateUserService(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", error);
    const err = new Error(error.message || "Failed to update profile");
    err.status = 500;
    next(err);
  }
};

/**
 * =========================================================
 * PATCH-STYLE AVATAR FILE UPLOAD
 * =========================================================
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide an image file to upload"
      });
    }

    const secureUrl = req.file.path; // Cloudinary secure URL populated by multer-storage-cloudinary
    console.log("🖼️ File uploaded to Cloudinary:", secureUrl);

    // Save strictly to DB via atomic $set partial update
    const updatedUser = await updateUserService(userId, {
      "avatar": secureUrl,
      "profile.avatar": secureUrl
    });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded and updated successfully",
      data: secureUrl,
      user: updatedUser
    });
  } catch (error) {
    console.error("❌ Avatar Upload Error:", error);
    const err = new Error(error.message || "Failed to upload avatar");
    err.status = 500;
    next(err);
  }
};

/**
 * =========================================================
 * CHANGE PASSWORD
 * =========================================================
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    await changePasswordService(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * REQUEST PHONE CHANGE
 * =========================================================
 */
export const requestPhoneChange = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const userId = req.user.id;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const result = await requestPhoneChangeService(userId, phone);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * VERIFY PHONE OTP
 * =========================================================
 */
export const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "Verification OTP code is required",
      });
    }

    const updatedUser = await verifyPhoneOtpService(userId, otp);
    res.status(200).json({
      success: true,
      message: "Phone number verified and updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * RESEND PHONE OTP
 * =========================================================
 */
export const resendPhoneOtp = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await resendPhoneOtpService(userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * REQUEST EMAIL CHANGE
 * =========================================================
 */
export const requestEmailChange = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const result = await requestEmailChangeService(userId, email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * VERIFY EMAIL TOKEN
 * =========================================================
 */
export const verifyEmailToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const updatedUser = await verifyEmailTokenService(userId, token);
    res.status(200).json({
      success: true,
      message: "Email verified and updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * =========================================================
 * DEACTIVATE ACCOUNT (SOFT DELETE)
 * =========================================================
 */
export const deactivateAccount = async (req, res, next) => {
  try {
    const password = req.body.password || req.body.confirmPassword;
    const userId = req.user.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password confirmation is required to deactivate account",
      });
    }

    const result = await deactivateAccountService(userId, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};