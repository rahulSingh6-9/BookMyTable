import express from "express";
import * as controller from "./settings.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

/**
 * GET SETTINGS (Public/Staff)
 */
router.get("/:restaurantId", controller.getSettingsController);

/**
 * 🔐 PROTECTED SETTINGS UPDATES
 * Requires MANAGE_SETTINGS permission
 */
router.patch("/:restaurantId/schedule", protect, authorize("MANAGE_SETTINGS"), controller.updateScheduleController);
router.patch("/:restaurantId/slot-config", protect, authorize("MANAGE_SETTINGS"), controller.updateSlotConfigController);
router.post("/:restaurantId/special-days", protect, authorize("MANAGE_SETTINGS"), controller.addSpecialDayController);
router.delete("/:restaurantId/special-days/:date", protect, authorize("MANAGE_SETTINGS"), controller.deleteSpecialDayController);

export default router;