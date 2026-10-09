import express from "express";
import { getDiscoveryRestaurants, featureRestaurant, hideRestaurant } from "./adminDiscovery.controller.js";
import { protect, requirePermission } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getDiscoveryRestaurants);
router.patch("/:id/feature", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), featureRestaurant);
router.patch("/:id/hide", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), hideRestaurant);

export default router;
