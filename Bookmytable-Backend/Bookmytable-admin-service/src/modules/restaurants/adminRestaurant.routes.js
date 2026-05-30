import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";

import {
  getAllRestaurants,
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
  getRestaurantDetails,
  getRestaurantMetrics,
  getRestaurantTables,
  getRestaurantStaff,
} from "./adminRestaurant.controller.js";

import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getAllRestaurants);
router.get("/:id", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getRestaurantDetails);
router.get("/:id/metrics", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getRestaurantMetrics);
router.get("/:id/tables", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getRestaurantTables);
router.get("/:id/staff", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getRestaurantStaff);

router.patch("/:id/approve", requirePermission(PERMISSIONS.RESTAURANTS_APPROVE), approveRestaurant);
router.patch("/:id/suspend", requirePermission(PERMISSIONS.RESTAURANTS_SUSPEND), suspendRestaurant);
router.patch("/:id/reject", requirePermission(PERMISSIONS.RESTAURANTS_APPROVE), rejectRestaurant);

export default router;