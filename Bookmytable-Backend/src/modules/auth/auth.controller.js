import {
  loginWebUser,
  loginAdminUser,
  signupUser,
  resetPassword,
  forgotPassword,
  verifyResetToken,
  googleAuthService,
} from "./auth.service.js";

// 🟢 WEB LOGIN
export const loginWeb = async (req, res, next) => {
  try {
    const result = await loginWebUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔴 ADMIN LOGIN
export const loginAdmin = async (req, res, next) => {
  try {
    const result = await loginAdminUser(req.body); // ✅ fixed

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 📝 SIGNUP
export const signup = async (req, res, next) => {
  try {
    const result = await signupUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔁 FORGOT PASSWORD
export const forgotpassword = async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);

    res.status(202).json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔁 RESET PASSWORD
export const resetpassword = async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔍 VERIFY RESET TOKEN
export const verifyResetTokenController = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = await verifyResetToken(token);

    res.status(200).json({
      success: true,
      message: "Token is valid",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔵 GOOGLE SIGNUP/LOGIN CONTROLLER
export const googleLogin = async (req, res, next) => {
  try {
    const result = await googleAuthService(req.body);

    res.status(200).json({
      success: true,
      message: result.isNewUser ? "Google registration successful" : "Google login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
