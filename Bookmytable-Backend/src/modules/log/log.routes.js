import express from "express";
import { getLogsController, getBrandLogsController } from "./log.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

// 🔐 Restaurant-specific logs
// Requires VIEW_ANALYTICS or similar permission
router.get("/:restaurantId", protect, authorize("VIEW_ANALYTICS"), getLogsController);

// 🔐 Brand-specific logs
// Requires brand management permission
router.get("/brand/:brandId", protect, getBrandLogsController);

export default router;
