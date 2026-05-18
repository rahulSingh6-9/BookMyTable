import express from "express";
import { 
  create, 
  getAll, 
  getMyRestaurant,
  updateRestaurantCoverImage,
  addRestaurantGalleryImage,
  deleteRestaurantGalleryImage
} from "./restaurant.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRestaurantSchema } from "../../validation/restaurant.joi.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

// 🌍 PUBLIC — any visitor can browse restaurants
router.get("/", getAll);

// 👤 PRIVATE — get user's branches/memberships
router.get('/my', protect, getMyRestaurant);

// 🏢 OWNER/ADMIN ONLY — create a new restaurant branch
router.post("/", protect, validate(createRestaurantSchema), create);

// 🖼️ MEDIA & BRANDING - Standalone upload / gallery routes
router.patch("/:id/cover-image", protect, upload.single("image"), updateRestaurantCoverImage);
router.post("/:id/gallery", protect, upload.array("files", 10), addRestaurantGalleryImage);
router.delete("/:id/gallery/:imageId", protect, deleteRestaurantGalleryImage);

export default router;