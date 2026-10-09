import express from "express";
import {
  initiateHold,
  releaseHold,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getRestaurantBookings,
  updateBookingStatus,
  createBooking,
} from "./booking.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Table Hold & Checkout Flow
router.post("/hold", protect, initiateHold);
router.post("/release-hold", protect, releaseHold);

// Customer User Bookings
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/cancel", protect, cancelBooking);

// Restaurant Staff / Owner Management
router.get("/restaurant/:restaurantId", protect, getRestaurantBookings);
router.patch("/:id/status", protect, updateBookingStatus);

// Legacy direct create booking
router.post("/", protect, createBooking);

export default router;
