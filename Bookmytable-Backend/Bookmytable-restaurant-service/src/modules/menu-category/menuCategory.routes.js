import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "./menuCategory.controller.js";

const router = express.Router();

// 🔥 REST APIs

// Create
router.post("/:restaurantId", protect, createCategory);

// Get all
router.get("/:restaurantId", protect, getCategories);

// Update
router.put("/:categoryId", protect, updateCategory);

// Delete
router.delete("/:categoryId", protect, deleteCategory);

export default router;