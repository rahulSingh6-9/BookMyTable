import { z } from "zod";

// ──────────────────────────────────────────────
// UNIFIED RESTAURANT SCHEMA (Frontend + Backend)
// ──────────────────────────────────────────────


export const step1Schema = z.object({
  restaurantName: z.string().min(3, "Restaurant name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceRange: z.string().min(1, "Select price range"),
  cuisines: z.array(z.string()).min(1, "Select at least one cuisine"),
});

export const step2Schema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
});

export const step3Schema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email address"),
});

export const restaurantSchema = z.object({
  // Base fields
  name: z.string().min(2, "Restaurant name must be at least 2 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  
  // Array of cuisines (often used by frontend)
  cuisines: z.array(z.string()).min(1, "At least one cuisine is required").default([]),
  
  // Legacy singular field if necessary (optional fallback)
  cuisine: z.string().optional(),

  // Location
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  
  // Contact
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, "Invalid phone number format").optional(),

  // Filtering metadata
  priceRange: z.enum(["budget", "moderate", "premium", "luxury"]).optional(),
  rating: z.number().min(0).max(5).optional(),

  // Settings
  openingHours: z
    .record(
      z.object({
        isOpen: z.boolean(),
        slots: z.array(z.object({ open: z.string(), close: z.string() })).default([]),
      })
    )
    .optional(),
});

export const createRestaurantSchema = restaurantSchema;
export const updateRestaurantSchema = restaurantSchema.partial();
export const restaurantFilterSchema = restaurantSchema.pick({ cuisines: true, priceRange: true, city: true, rating: true }).partial();