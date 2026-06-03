import express from "express";
import { getDiscoveryRestaurants, featureRestaurant, hideRestaurant } from "./adminDiscovery.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/restaurants", getDiscoveryRestaurants);
router.put("/restaurants/:id/feature", requirePermission([PERMISSIONS.BRANDS_MANAGE]), featureRestaurant);
router.put("/restaurants/:id/hide", requirePermission([PERMISSIONS.BRANDS_MANAGE]), hideRestaurant);

export default router;
