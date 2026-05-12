import express from "express";
import { getLogsController } from "./log.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

// 🔐 Restaurant-specific logs
// Requires VIEW_ANALYTICS or similar permission
router.get("/:restaurantId", protect, authorize("VIEW_ANALYTICS"), getLogsController);

export default router;