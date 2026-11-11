import {
  submitReviewService,
  getBookingReviewService,
  getRestaurantReviewsService,
  updateReviewService,
  deleteReviewService,
  getBranchReviewsService,
  recalculateRestaurantAggregate,
} from "./review.service.js";

/**
 * POST /api/reviews
 * Customer submits a review for an eligible booking
 */
export const submitReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "You must be logged in to submit a review.",
      });
    }

    const { bookingId, ratings, review: reviewText } = req.body;
    const result = await submitReviewService({
      userId,
      bookingId,
      ratings,
      reviewText,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted.",
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "REVIEW_SUBMISSION_FAILED",
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/booking/:bookingId
 * Get customer's review & review eligibility for a booking
 */
export const getBookingReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please log in to view review details.",
      });
    }

    const data = await getBookingReviewService(bookingId, userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "REVIEW_FETCH_FAILED",
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/restaurant/:restaurantId
 * Public listing of published reviews for a restaurant with summary & pagination
 */
export const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page, limit, sort } = req.query;

    const data = await getRestaurantReviewsService(restaurantId, { page, limit, sort });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "REVIEWS_FETCH_FAILED",
      message: error.message,
    });
  }
};

/**
 * PUT /api/reviews/:reviewId
 * Customer updates their existing review
 */
export const updateReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { ratings, review: reviewText } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please log in to edit your review.",
      });
    }

    const result = await updateReviewService(reviewId, userId, {
      ratings,
      reviewText,
    });

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "REVIEW_UPDATE_FAILED",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Customer deletes their review
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Please log in to delete your review.",
      });
    }

    const result = await deleteReviewService(reviewId, userId);
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      data: result,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "REVIEW_DELETE_FAILED",
      message: error.message,
    });
  }
};

/**
 * GET /api/reviews/branch/:branchId
 * Restaurant Staff/Owner view reviews for their branch
 */
export const getBranchReviews = async (req, res) => {
  try {
    const staffUserId = req.user?.id;
    const { branchId } = req.params;
    const { page, limit, minRating } = req.query;

    if (!staffUserId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Staff authentication required.",
      });
    }

    const data = await getBranchReviewsService(branchId, staffUserId, {
      page,
      limit,
      minRating,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({
      success: false,
      code: error.code || "BRANCH_REVIEWS_FAILED",
      message: error.message,
    });
  }
};

/**
 * POST /api/reviews/restaurant/:restaurantId/recalculate
 * Administrative / reconciliation endpoint to rebuild aggregate
 */
export const recalculateAggregate = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const result = await recalculateRestaurantAggregate(restaurantId);
    return res.status(200).json({
      success: true,
      message: "Restaurant ratings aggregate recalculated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
