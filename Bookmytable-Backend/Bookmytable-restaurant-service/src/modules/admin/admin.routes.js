import express from "express";
import { getAllRestaurantsForAdmin } from "./admin.controller.js";

const router = express.Router();

// Internal use only (Admin Service ke liye)
router.get("/restaurants/export", getAllRestaurantsForAdmin);

export default router;