import express from "express";
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "./menuItem.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

// ✅ Public Get
router.get("/:restaurantId", getMenuItems);

// 🔐 Protected Routes
router.post("/:restaurantId", protect, authorize("MANAGE_MENU"), upload.single("image"), createMenuItem);
router.put("/:itemId", protect, authorize("MANAGE_MENU"), upload.single("image"), updateMenuItem);
router.delete("/:itemId", protect, authorize("MANAGE_MENU"), deleteMenuItem);

export default router;