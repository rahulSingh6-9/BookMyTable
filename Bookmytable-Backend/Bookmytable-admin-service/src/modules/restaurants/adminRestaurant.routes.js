import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";

import {
  getAllRestaurants,
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
} from "./adminRestaurant.controller.js";

import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getAllRestaurants);
router.patch("/:id/approve", requirePermission(PERMISSIONS.RESTAURANTS_APPROVE), approveRestaurant);
router.patch("/:id/suspend", requirePermission(PERMISSIONS.RESTAURANTS_SUSPEND), suspendRestaurant);
router.patch("/:id/reject", requirePermission(PERMISSIONS.RESTAURANTS_APPROVE), rejectRestaurant);


export default router;