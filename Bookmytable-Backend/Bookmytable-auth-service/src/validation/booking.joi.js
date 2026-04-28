import Joi from "joi";

export const createBookingSchema = Joi.object({
  restaurantId: Joi.string().required().messages({
    "any.required": "Restaurant ID is required",
  }),
  tableId: Joi.string().required().messages({
    "any.required": "Table ID is required",
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Date must be in YYYY-MM-DD format",
      "any.required": "Date is required",
    }),
  time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be in HH:MM format",
      "any.required": "Time is required",
    }),
  guests: Joi.number().integer().min(1).max(100).required().messages({
    "number.min": "At least 1 guest required",
    "number.max": "Cannot book for more than 100 guests",
    "any.required": "Number of guests is required",
  }),
  specialRequest: Joi.string().max(500).allow("").optional(),
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "cancelled", "no-show", "completed")
    .required()
    .messages({
      "any.only": "Invalid booking status",
      "any.required": "Status is required",
    }),
});
