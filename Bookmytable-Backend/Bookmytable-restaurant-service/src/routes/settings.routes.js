import express from "express";
import * as controller from "../controllers/settings.controller.js";

const router = express.Router();

/**
 * GET SETTINGS
 */
router.get("/:restaurantId", controller.getSettingsController);

/**
 * UPDATE SCHEDULE
 */
router.patch("/:restaurantId/schedule", controller.updateScheduleController);

/**
 * UPDATE SLOT CONFIG
 */
router.patch("/:restaurantId/slot-config", controller.updateSlotConfigController);

/**
 * SPECIAL DAYS
 */
router.post("/:restaurantId/special-days", controller.addSpecialDayController);
router.delete("/:restaurantId/special-days/:date", controller.deleteSpecialDayController);

export default router;