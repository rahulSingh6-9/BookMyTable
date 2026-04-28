import { getCurrentUserService, updateUserService, changePasswordService } from "../services/user.service.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUserService(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    let { avatar } = req.body;
    const userId = req.user._id;
    
    // 🔥 Handle avatar safely
    if (req.file) {
      avatar = req.file.path;
    } else if (avatar && typeof avatar !== "string") {
      // If it's not a file and not a string (e.g. an empty object {} from a failed FormData serialization), discard it
      avatar = undefined;
    }
    
    console.log("📝 Update Profile Request:", { userId, name, phone, avatar, file: req.file }); //++++Testing
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }
    
    const updatedUser = await updateUserService(userId, {
      name: name.trim(),
      phone: phone || "",
      avatar,
    });

    console.log("✅ Profile Updated:", updatedUser); //++++Testing

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("❌ Profile Update Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    }); //++++Testing
    
    const err = new Error(error.message || "Failed to update profile");
    err.status = 500;
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

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