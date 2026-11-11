import Joi from "joi";

export const createReviewSchema = Joi.object({
  bookingId: Joi.string().required().messages({
    "any.required": "Booking ID is required to submit a review",
  }),
  ratings: Joi.object({
    food: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Food rating must be at least 1 star",
      "number.max": "Food rating cannot exceed 5 stars",
      "any.required": "Food rating is required",
    }),
    ambience: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Ambience rating must be at least 1 star",
      "number.max": "Ambience rating cannot exceed 5 stars",
      "any.required": "Ambience rating is required",
    }),
    service: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Service rating must be at least 1 star",
      "number.max": "Service rating cannot exceed 5 stars",
      "any.required": "Service rating is required",
    }),
  }).required().messages({
    "any.required": "All three rating categories (Food, Ambience, Service) are required",
  }),
  review: Joi.string().max(2000).allow("").optional(),
});

export const updateReviewSchema = Joi.object({
  ratings: Joi.object({
    food: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Food rating must be at least 1 star",
      "number.max": "Food rating cannot exceed 5 stars",
      "any.required": "Food rating is required",
    }),
    ambience: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Ambience rating must be at least 1 star",
      "number.max": "Ambience rating cannot exceed 5 stars",
      "any.required": "Ambience rating is required",
    }),
    service: Joi.number().integer().min(1).max(5).required().messages({
      "number.min": "Service rating must be at least 1 star",
      "number.max": "Service rating cannot exceed 5 stars",
      "any.required": "Service rating is required",
    }),
  }).required(),
  review: Joi.string().max(2000).allow("").optional(),
});
