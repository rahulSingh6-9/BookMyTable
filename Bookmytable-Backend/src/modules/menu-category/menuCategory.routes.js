import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "./menuCategory.controller.js";

const router = express.Router();

// 📋 Get all (Public/Staff)
router.get("/:restaurantId", getCategories);

// 🔐 Protected Routes - Requires MANAGE_MENU permission
router.post("/:restaurantId", protect, authorize("MANAGE_MENU"), createCategory);
router.put("/:categoryId", protect, authorize("MANAGE_MENU"), updateCategory);
router.delete("/:categoryId", protect, authorize("MANAGE_MENU"), deleteCategory);

export default router;