import express from "express";
import {
  inviteStaffController,
  acceptInviteController,
  listStaffController,
  updateStaffController,
  deleteStaffController,
} from "./staff.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";
import { rateLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

// 🚀 Apply basic rate limiting to all staff routes
router.use(rateLimiter(20, 60)); // 20 requests per minute

// 🔐 Owner/Manager invites staff
// Requires 'MANAGE_STAFF' permission
router.post("/invite/:restaurantId", protect, authorize("MANAGE_STAFF"), inviteStaffController);

// 👤 Staff accepts invite (Public/Semi-public)
router.post("/accept-invite", acceptInviteController);

// 📋 List staff for a restaurant
router.get("/:restaurantId/list", protect, authorize("MANAGE_STAFF"), listStaffController);

// ✏️ Update staff role/permissions/status
router.patch("/:staffId", protect, authorize("MANAGE_STAFF"), updateStaffController);

// 🗑️ Soft delete staff
router.delete("/:staffId", protect, authorize("MANAGE_STAFF"), deleteStaffController);

export default router;