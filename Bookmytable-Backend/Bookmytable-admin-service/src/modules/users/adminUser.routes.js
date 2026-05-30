import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";
import {
  getAllUsersController,
  getUserDetailsController,
  getUserActivityController,
  getUserBookingsController,
  getUserRestaurantsController,
  forceLogoutController,
  banUser,
  unbanUser,
  updateUserRole,
} from "./adminUser.controller.js";

import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.USERS_VIEW), getAllUsersController);
router.get("/:id", requirePermission(PERMISSIONS.USERS_VIEW), getUserDetailsController);
router.get("/:id/activity", requirePermission(PERMISSIONS.USERS_VIEW), getUserActivityController);
router.get("/:id/bookings", requirePermission(PERMISSIONS.USERS_VIEW), getUserBookingsController);
router.get("/:id/restaurants", requirePermission(PERMISSIONS.USERS_VIEW), getUserRestaurantsController);

router.patch("/:id/ban", requirePermission(PERMISSIONS.USERS_BLOCK), banUser);
router.patch("/:id/unban", requirePermission(PERMISSIONS.USERS_BLOCK), unbanUser);
router.patch("/:id/role", requirePermission(PERMISSIONS.USERS_EDIT), updateUserRole);
router.post("/:id/force-logout", requirePermission(PERMISSIONS.USERS_BLOCK), forceLogoutController);

export default router;
