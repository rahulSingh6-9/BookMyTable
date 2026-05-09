import express from "express";
import {
  inviteStaffController,
  acceptInviteController,
  listStaffController,
  updateStaffController,
  deleteStaffController,
} from "./staff.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// 🚀 Apply basic rate limiting to all staff routes
router.use(rateLimiter(20, 60)); // 20 requests per minute

// 🔐 Owner invites staff
router.post("/invite/:restaurantId", protect, inviteStaffController);

// 👤 Staff accepts invite
router.post("/accept-invite", acceptInviteController);

// 📋 List staff for a restaurant (Owner)
router.get("/:restaurantId/list", protect, listStaffController);

// ✏️ Update staff role/permissions/status (Owner)
router.patch("/:staffId", protect, updateStaffController);

// 🗑️ Soft delete staff (Owner)
router.delete("/:staffId", protect, deleteStaffController);

export default router;