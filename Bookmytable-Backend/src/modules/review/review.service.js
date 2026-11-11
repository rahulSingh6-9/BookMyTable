import mongoose from "mongoose";
import Review from "../../models/review.model.js";
import Booking from "../../models/booking.model.js";
import Restaurant from "../../models/restaurant.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import { syncRestaurantToDiscovery } from "../discovery/discovery.service.js";
import { getIO } from "../../config/socket.js";
import { getScheduledEpoch } from "../booking/booking.service.js";

/**
 * ─────────────────────────────────────────────────────────────
 * RECALCULATE RESTAURANT AGGREGATES
 * Computes exact average rating from individual overall ratings,
 * category breakdown, and total review count from published reviews.
 * ─────────────────────────────────────────────────────────────
 */
export const recalculateRestaurantAggregate = async (restaurantId, session = null) => {
  const restaurantObjectId = new mongoose.Types.ObjectId(String(restaurantId));

  const aggregationPipeline = [
    {
      $match: {
        restaurant: restaurantObjectId,
        status: "published",
      },
    },
    {
      $group: {
        _id: "$restaurant",
        totalReviews: { $sum: 1 },
        totalRatingSum: { $sum: "$overallRating" },
        avgFood: { $avg: "$ratings.food" },
        avgAmbience: { $avg: "$ratings.ambience" },
        avgService: { $avg: "$ratings.service" },
        star5: { $sum: { $cond: [{ $gte: ["$overallRating", 4.5] }, 1, 0] } },
        star4: { $sum: { $cond: [{ $and: [{ $gte: ["$overallRating", 3.5] }, { $lt: ["$overallRating", 4.5] }] }, 1, 0] } },
        star3: { $sum: { $cond: [{ $and: [{ $gte: ["$overallRating", 2.5] }, { $lt: ["$overallRating", 3.5] }] }, 1, 0] } },
        star2: { $sum: { $cond: [{ $and: [{ $gte: ["$overallRating", 1.5] }, { $lt: ["$overallRating", 2.5] }] }, 1, 0] } },
        star1: { $sum: { $cond: [{ $lt: ["$overallRating", 1.5] }, 1, 0] } },
      },
    },
  ];

  const results = session
    ? await Review.aggregate(aggregationPipeline).session(session)
    : await Review.aggregate(aggregationPipeline);

  let averageRating = 0;
  let totalReviews = 0;
  let totalRatingSum = 0;
  let ratingBreakdown = { food: 0, ambience: 0, service: 0 };
  let starDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (results && results.length > 0) {
    const stats = results[0];
    totalReviews = stats.totalReviews || 0;
    totalRatingSum = Math.round((stats.totalRatingSum || 0) * 100) / 100;
    averageRating = totalReviews > 0 ? Math.round((totalRatingSum / totalReviews) * 100) / 100 : 0;

    ratingBreakdown = {
      food: Math.round((stats.avgFood || 0) * 100) / 100,
      ambience: Math.round((stats.avgAmbience || 0) * 100) / 100,
      service: Math.round((stats.avgService || 0) * 100) / 100,
    };

    starDistribution = {
      5: stats.star5 || 0,
      4: stats.star4 || 0,
      3: stats.star3 || 0,
      2: stats.star2 || 0,
      1: stats.star1 || 0,
    };
  }

  // Update Restaurant Branch model
  const updateQuery = {
    averageRating,
    totalReviews,
    totalRatingSum,
    ratingBreakdown,
  };

  const updateOptions = session ? { session, new: true } : { new: true };
  await Restaurant.findByIdAndUpdate(restaurantObjectId, { $set: updateQuery }, updateOptions);

  // Synchronize Discovery Read Model (CQRS projection)
  try {
    await syncRestaurantToDiscovery(restaurantObjectId);
  } catch (err) {
    console.warn("⚠️ [Discovery Sync Warning] Failed to sync discovery rating:", err.message);
  }

  // Broadcast real-time socket event to all clients
  try {
    const io = getIO();
    if (io) {
      const payload = {
        restaurantId: String(restaurantObjectId),
        averageRating,
        totalReviews,
        ratingBreakdown,
        starDistribution,
      };
      // Broadcast to restaurant-specific room
      io.to(`restaurant_${restaurantObjectId}`).emit("restaurant_rating_updated", payload);
      // Broadcast to general discovery feed
      io.emit("discovery_rating_updated", payload);
    }
  } catch (err) {
    console.warn("⚠️ [Socket Warning] Could not emit rating update:", err.message);
  }

  return {
    averageRating,
    totalReviews,
    totalRatingSum,
    ratingBreakdown,
    starDistribution,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * CHECK BOOKING REVIEW ELIGIBILITY
 * Validates ownership, completed QR check-in, payment, and timestamp.
 * ─────────────────────────────────────────────────────────────
 */
export const checkBookingReviewEligibility = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate("restaurantId", "name timezone slug");
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.code = "BOOKING_NOT_FOUND";
    throw err;
  }

  // Ownership check
  if (String(booking.userId) !== String(userId)) {
    const err = new Error("You are not authorized to review this booking");
    err.statusCode = 403;
    err.code = "UNAUTHORIZED_BOOKING";
    throw err;
  }

  // Check if booking already reviewed
  const existingReview = await Review.findOne({ booking: booking._id, status: { $ne: "deleted" } });
  if (existingReview) {
    return {
      eligible: false,
      reason: "ALREADY_REVIEWED",
      message: "You have already submitted a review for this reservation.",
      booking,
      existingReview,
    };
  }

  // Payment check
  if (
    booking.paymentStatus === "failed" ||
    booking.status === "payment_failed" ||
    booking.paymentStatus === "pending" ||
    booking.status === "payment_pending"
  ) {
    return {
      eligible: false,
      reason: "PAYMENT_NOT_COMPLETED",
      message: "Reviews can only be submitted for completed and confirmed bookings.",
      booking,
    };
  }

  // Ineligible statuses (cancelled, expired, no_show)
  if (["cancelled", "expired", "no_show"].includes(booking.status)) {
    return {
      eligible: false,
      reason: "INELIGIBLE_STATUS",
      message: `Cannot review reservation with status '${booking.status}'.`,
      booking,
    };
  }

  // QR Check-in verification
  const isQrCheckedIn =
    booking.qrCode?.status === "used" &&
    booking.qrCode?.checkedInAt != null;

  const isCompletedVisit =
    booking.status === "completed" ||
    (booking.status === "checked_in" && isQrCheckedIn);

  if (!isCompletedVisit) {
    return {
      eligible: false,
      reason: "NOT_CHECKED_IN",
      message: "You can submit a review once you have checked in for your table reservation.",
      booking,
    };
  }

  // Future booking check
  const now = new Date();
  const timeZone = booking.restaurantId?.timezone || "Asia/Kolkata";
  let scheduledEpoch;
  try {
    scheduledEpoch = getScheduledEpoch(booking.date, booking.time, timeZone);
  } catch (e) {
    scheduledEpoch = new Date(`${booking.date}T${booking.time}:00Z`).getTime();
  }

  // If status is checked_in, ensure visit isn't in the far future
  if (booking.status === "checked_in" && now.getTime() < scheduledEpoch) {
    return {
      eligible: false,
      reason: "VISIT_NOT_CONCLUDED",
      message: "Your dining time has not arrived yet. Please review after your meal.",
      booking,
    };
  }

  return {
    eligible: true,
    booking,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 1. SUBMIT REVIEW (Customer)
 * ─────────────────────────────────────────────────────────────
 */
export const submitReviewService = async ({ userId, bookingId, ratings, reviewText }) => {
  // Validate eligibility
  const eligibility = await checkBookingReviewEligibility(bookingId, userId);
  if (!eligibility.eligible) {
    const err = new Error(eligibility.message);
    err.statusCode = 400;
    err.code = eligibility.reason;
    throw err;
  }

  const booking = eligibility.booking;
  const restaurantId = booking.restaurantId._id || booking.restaurantId;

  // Calculate customer's overall rating: (food + ambience + service) / 3
  const food = Number(ratings.food);
  const ambience = Number(ratings.ambience);
  const service = Number(ratings.service);

  if (isNaN(food) || isNaN(ambience) || isNaN(service)) {
    const err = new Error("All category ratings must be valid numbers");
    err.statusCode = 400;
    err.code = "INVALID_RATINGS";
    throw err;
  }

  const rawOverall = (food + ambience + service) / 3;
  const overallRating = Math.round(rawOverall * 100) / 100;

  // Create Review
  const newReview = await Review.create({
    user: userId,
    restaurant: restaurantId,
    booking: booking._id,
    ratings: {
      food,
      ambience,
      service,
    },
    overallRating,
    review: reviewText ? reviewText.trim() : "",
    status: "published",
  });

  // Link review to booking document
  await Booking.findByIdAndUpdate(booking._id, {
    $set: {
      review: newReview._id,
      hasReviewed: true,
    },
  });

  // Recalculate restaurant aggregate
  const updatedAggregates = await recalculateRestaurantAggregate(restaurantId);

  return {
    review: newReview,
    restaurantAggregates: updatedAggregates,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 2. GET REVIEW FOR A SPECIFIC BOOKING (Customer)
 * ─────────────────────────────────────────────────────────────
 */
export const getBookingReviewService = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId).populate("restaurantId", "name slug");
  if (!booking) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    err.code = "BOOKING_NOT_FOUND";
    throw err;
  }

  if (String(booking.userId) !== String(userId)) {
    const err = new Error("Unauthorized to access this booking");
    err.statusCode = 403;
    err.code = "UNAUTHORIZED_BOOKING";
    throw err;
  }

  const review = await Review.findOne({
    booking: bookingId,
    status: { $ne: "deleted" },
  });

  const eligibility = await checkBookingReviewEligibility(bookingId, userId);

  return {
    bookingId,
    restaurantName: booking.restaurantId?.name,
    hasReviewed: Boolean(review),
    review: review || null,
    eligibleForReview: eligibility.eligible,
    eligibilityReason: eligibility.reason || null,
    eligibilityMessage: eligibility.message || null,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 3. GET RESTAURANT REVIEWS (Public)
 * ─────────────────────────────────────────────────────────────
 */
export const getRestaurantReviewsService = async (restaurantParam, { page = 1, limit = 10, sort = "newest" } = {}) => {
  let restaurant;
  if (mongoose.Types.ObjectId.isValid(restaurantParam)) {
    restaurant = await Restaurant.findById(restaurantParam);
  }
  if (!restaurant) {
    restaurant = await Restaurant.findOne({ slug: restaurantParam });
  }

  if (!restaurant) {
    const err = new Error("Restaurant not found");
    err.statusCode = 404;
    err.code = "RESTAURANT_NOT_FOUND";
    throw err;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (parsedPage - 1) * parsedLimit;

  let sortOption = { createdAt: -1 };
  if (sort === "highest") sortOption = { overallRating: -1, createdAt: -1 };
  if (sort === "lowest") sortOption = { overallRating: 1, createdAt: -1 };

  const query = {
    restaurant: restaurant._id,
    status: "published",
  };

  const [reviews, totalCount] = await Promise.all([
    Review.find(query)
      .populate("user", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Review.countDocuments(query),
  ]);

  // Obfuscate / format user name for privacy (e.g. "Rahul S.")
  const formattedReviews = reviews.map((r) => {
    let displayName = "Verified Diner";
    if (r.user?.name) {
      const parts = r.user.name.trim().split(" ");
      displayName = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
    }
    return {
      _id: r._id,
      userDisplayName: displayName,
      overallRating: r.overallRating,
      ratings: r.ratings,
      review: r.review,
      createdAt: r.createdAt,
      verifiedDiner: true,
    };
  });

  // Calculate star distribution percentages
  const total = restaurant.totalReviews || 0;
  const avgRating = restaurant.averageRating || 0;

  return {
    restaurantId: restaurant._id,
    restaurantName: restaurant.name || restaurant.branchName,
    averageRating: avgRating,
    totalReviews: total,
    ratingBreakdown: restaurant.ratingBreakdown || { food: 0, ambience: 0, service: 0 },
    reviews: formattedReviews,
    pagination: {
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalCount / parsedLimit),
      hasMore: skip + reviews.length < totalCount,
    },
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 4. EDIT REVIEW (Customer)
 * ─────────────────────────────────────────────────────────────
 */
export const updateReviewService = async (reviewId, userId, { ratings, reviewText }) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    err.code = "REVIEW_NOT_FOUND";
    throw err;
  }

  // Ownership check
  if (String(review.user) !== String(userId)) {
    const err = new Error("You are not authorized to edit this review");
    err.statusCode = 403;
    err.code = "UNAUTHORIZED_REVIEW_EDIT";
    throw err;
  }

  if (review.status === "deleted") {
    const err = new Error("Cannot edit a deleted review");
    err.statusCode = 400;
    err.code = "REVIEW_DELETED";
    throw err;
  }

  // Re-calculate overall rating
  const food = Number(ratings.food);
  const ambience = Number(ratings.ambience);
  const service = Number(ratings.service);

  if (isNaN(food) || isNaN(ambience) || isNaN(service)) {
    const err = new Error("All rating categories must be valid numbers");
    err.statusCode = 400;
    err.code = "INVALID_RATINGS";
    throw err;
  }

  const overallRating = Math.round(((food + ambience + service) / 3) * 100) / 100;

  review.ratings = { food, ambience, service };
  review.overallRating = overallRating;
  if (reviewText !== undefined) {
    review.review = reviewText ? reviewText.trim() : "";
  }
  await review.save();

  // Recalculate restaurant aggregate
  const updatedAggregates = await recalculateRestaurantAggregate(review.restaurant);

  return {
    review,
    restaurantAggregates: updatedAggregates,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 5. DELETE REVIEW (Customer)
 * ─────────────────────────────────────────────────────────────
 */
export const deleteReviewService = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error("Review not found");
    err.statusCode = 404;
    err.code = "REVIEW_NOT_FOUND";
    throw err;
  }

  if (String(review.user) !== String(userId)) {
    const err = new Error("You are not authorized to delete this review");
    err.statusCode = 403;
    err.code = "UNAUTHORIZED_REVIEW_DELETE";
    throw err;
  }

  const restaurantId = review.restaurant;
  const bookingId = review.booking;

  // Soft delete review
  review.status = "deleted";
  await review.save();

  // Unlink review from booking
  await Booking.findByIdAndUpdate(bookingId, {
    $set: { hasReviewed: false },
    $unset: { review: "" },
  });

  // Recalculate restaurant aggregate
  const updatedAggregates = await recalculateRestaurantAggregate(restaurantId);

  return {
    success: true,
    message: "Review deleted successfully",
    restaurantAggregates: updatedAggregates,
  };
};

/**
 * ─────────────────────────────────────────────────────────────
 * 6. GET BRANCH REVIEWS (Restaurant Staff / Owner Dashboard)
 * ─────────────────────────────────────────────────────────────
 */
export const getBranchReviewsService = async (branchId, staffUserId, { page = 1, limit = 20, minRating } = {}) => {
  // Authorization check via BranchMembership
  const membership = await BranchMembership.findOne({
    branch: branchId,
    user: staffUserId,
    status: "active",
  });

  if (!membership) {
    const err = new Error("You do not have active staff permissions for this branch.");
    err.statusCode = 403;
    err.code = "STAFF_NOT_AUTHORIZED";
    throw err;
  }

  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {
    restaurant: branchId,
    status: "published",
  };

  if (minRating && !isNaN(Number(minRating))) {
    query.overallRating = { $gte: Number(minRating) };
  }

  const [reviews, totalCount, restaurant] = await Promise.all([
    Review.find(query)
      .populate("user", "name email phone")
      .populate("booking", "date time guests tableName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Review.countDocuments(query),
    Restaurant.findById(branchId).lean(),
  ]);

  return {
    branchId,
    branchName: restaurant?.name || restaurant?.branchName,
    averageRating: restaurant?.averageRating || 0,
    totalReviews: restaurant?.totalReviews || 0,
    ratingBreakdown: restaurant?.ratingBreakdown || { food: 0, ambience: 0, service: 0 },
    reviews,
    pagination: {
      total: totalCount,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalCount / parsedLimit),
    },
  };
};
