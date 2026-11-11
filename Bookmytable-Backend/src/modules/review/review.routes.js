import express from "express";
import {
  submitReview,
  getBookingReview,
  getRestaurantReviews,
  updateReview,
  deleteReview,
  getBranchReviews,
  recalculateAggregate,
} from "./review.controller.js";
import { protect, optionalProtect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createReviewSchema, updateReviewSchema } from "./review.joi.js";

const router = express.Router();

// 🌍 PUBLIC ENDPOINTS
router.get("/restaurant/:restaurantId", optionalProtect, getRestaurantReviews);

// 👤 CUSTOMER REVIEW ENDPOINTS (Protected)
router.post("/", protect, validate(createReviewSchema), submitReview);
router.get("/booking/:bookingId", protect, getBookingReview);
router.put("/:reviewId", protect, validate(updateReviewSchema), updateReview);
router.delete("/:reviewId", protect, deleteReview);

// 🏢 RESTAURANT / BRANCH STAFF ENDPOINTS (Protected)
router.get("/branch/:branchId", protect, getBranchReviews);

// 🛠️ MAINTENANCE / RECONCILIATION
router.post("/restaurant/:restaurantId/recalculate", protect, recalculateAggregate);

export default router;
