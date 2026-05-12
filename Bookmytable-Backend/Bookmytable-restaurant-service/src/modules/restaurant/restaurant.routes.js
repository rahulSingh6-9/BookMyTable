import express from "express";
import { create, getAll, getMyRestaurant } from "./restaurant.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRestaurantSchema } from "../../validation/restaurant.joi.js";

const router = express.Router();

// 🌍 PUBLIC — any visitor can browse restaurants
router.get("/", getAll);

// 👤 PRIVATE — get user's branches/memberships
router.get('/my', protect, getMyRestaurant);

// 🏢 OWNER/ADMIN ONLY — create a new restaurant branch
// Note: Global role check for creating a new branch
router.post("/", protect, validate(createRestaurantSchema), create);

export default router;