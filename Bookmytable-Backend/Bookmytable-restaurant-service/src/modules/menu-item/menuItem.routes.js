// src/routes/menuItem.routes.js

import express from "express";
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "./menuItem.controller.js";

import upload from "../../middleware/upload.js";

const router = express.Router();

// ✅ Create & Get
router.post("/:restaurantId", upload.single("image"), createMenuItem);
router.get("/:restaurantId", getMenuItems);

// ✅ Update & Delete
router.put("/:itemId", upload.single("image"), updateMenuItem);
router.delete("/:itemId", deleteMenuItem);

export default router;