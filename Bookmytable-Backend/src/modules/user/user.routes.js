import express from "express";
import { 
  getMe, 
  updateProfile, 
  uploadAvatar, 
  changePassword,
  requestPhoneChange,
  verifyPhoneOtp,
  resendPhoneOtp,
  requestEmailChange,
  verifyEmailToken,
  deactivateAccount,
  getFavorites,
  addFavorite,
  removeFavorite
} from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { upload } from "../../config/multer.js";

const router = express.Router();

// 👤 CURRENT USER PROFILE INFO (GET)
router.get("/me", protect, getMe);

// 👤 PARTIAL PROFILE UPDATE (PATCH)
router.patch("/me", protect, updateProfile);

// 🖼️ PROFILE AVATAR FILE UPLOAD (PATCH)
router.patch("/me/avatar", protect, upload.single("avatar"), uploadAvatar);

// 🔐 CHANGE PASSWORD (PUT)
router.put("/change-password", protect, changePassword);

// 📱 CONTACT & VERIFICATION FLOWS (POST)
router.post("/me/phone/request", protect, requestPhoneChange);
router.post("/me/phone/verify", protect, verifyPhoneOtp);
router.post("/me/phone/resend", protect, resendPhoneOtp);

router.post("/me/email/request", protect, requestEmailChange);
router.post("/me/email/verify", protect, verifyEmailToken);

// ❌ ACCOUNT SECURITY DEACTIVATION (POST)
router.post("/me/deactivate", protect, deactivateAccount);

// ❤️ FAVORITES (GET, POST, DELETE)
router.get("/favorites", protect, getFavorites);
router.post("/favorites/:restaurantId", protect, addFavorite);
router.delete("/favorites/:restaurantId", protect, removeFavorite);

export default router;