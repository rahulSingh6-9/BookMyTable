import Joi from "joi";

const dayScheduleSchema = Joi.object({
  open: Joi.number().min(0).max(1440).required(),
  close: Joi.number().min(0).max(1440).required(),
  isClosed: Joi.boolean().default(false),
  breaks: Joi.array().items(Joi.object({
    start: Joi.number().required(),
    end: Joi.number().required(),
  })).default([]),
});

export const createRestaurantSchema = Joi.object({
  brandId: Joi.string().required(),
  branchName: Joi.string().min(2).max(120).required(),
  slug: Joi.string().lowercase().required(),
  branchCode: Joi.string().uppercase().required(),
  description: Joi.string().max(3000).optional(),
  
  contact: Joi.object({
    primaryPhone: Joi.object({
      countryCode: Joi.string(),
      number: Joi.string(),
      e164: Joi.string(),
    }),
    email: Joi.string().email(),
  }).optional(),

  address: Joi.object({
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(""),
    postalCode: Joi.string(),
  }).required(),

  location: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).required(),

  cuisines: Joi.array().items(Joi.string()).default([]),
  
  openingHours: Joi.object({
    mon: dayScheduleSchema.required(),
    tue: dayScheduleSchema.required(),
    wed: dayScheduleSchema.required(),
    thu: dayScheduleSchema.required(),
    fri: dayScheduleSchema.required(),
    sat: dayScheduleSchema.required(),
    sun: dayScheduleSchema.required(),
  }).required(),

  bookingSettings: Joi.object({
    advanceBookingDays: Joi.number().default(30),
    slotDurationMinutes: Joi.number().default(60),
    maxGuestsPerBooking: Joi.number().default(20),
  }).optional(),

  timezone: Joi.string().default("Asia/Kolkata"),
  currency: Joi.string().default("INR"),
});

export const updateRestaurantSchema = createRestaurantSchema.fork(
  ["brandId", "branchName", "slug", "branchCode", "address", "location", "openingHours"],
  (schema) => schema.optional()
);
