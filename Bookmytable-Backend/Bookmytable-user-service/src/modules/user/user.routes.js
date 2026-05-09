import express from "express";
import { getMe, updateProfile, changePassword } from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { upload } from "../../config/multer.js";


const router = express.Router();

// 🔥 CURRENT USER PROFILE
router.get("/me", protect, getMe);

// 🔥 UPDATE PROFILE
router.put("/me", protect, upload.single("avatar"), updateProfile);

// 🔥 CHANGE PASSWORD
router.put("/change-password", protect, changePassword);




export default router;