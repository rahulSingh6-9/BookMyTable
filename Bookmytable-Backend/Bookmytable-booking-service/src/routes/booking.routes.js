import express from "express";
import { getAvailability, createBooking } from "../controllers/booking.controller.js";

const router = express.Router();

// Public availability endpoint
router.get("/public/availability/:restaurantId", getAvailability);

// Protected booking endpoint
// In a full implementation, you would add an auth middleware here
// e.g. router.post("/", protect, createBooking);
router.post("/", createBooking);

export default router;
