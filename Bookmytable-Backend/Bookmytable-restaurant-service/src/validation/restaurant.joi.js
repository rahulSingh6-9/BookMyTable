import Joi from "joi";

const slotSchema = Joi.object({
  open: Joi.string().required(),
  close: Joi.string().required(),
});

const dayScheduleSchema = Joi.object({
  isOpen: Joi.boolean().required(),
  slots: Joi.array().items(slotSchema).default([]),
});

export const restaurantSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  cuisines: Joi.array().items(Joi.string()).min(1).default([]),
  cuisine: Joi.string().optional(),
  address: Joi.string().min(5).required(),
  city: Joi.string().min(2).required(),
  phone: Joi.string().pattern(/^\+?[\d\s\-()]{7,20}$/).optional(),
  priceRange: Joi.string().valid("budget", "moderate", "premium", "luxury").optional(),
  rating: Joi.number().min(0).max(5).optional(),
  openingHours: Joi.object().pattern(Joi.string(), dayScheduleSchema).optional(),
});

export const createRestaurantSchema = restaurantSchema;
export const updateRestaurantSchema = restaurantSchema.fork(
  ["name", "description", "cuisines", "address", "city"],
  (schema) => schema.optional()
);
