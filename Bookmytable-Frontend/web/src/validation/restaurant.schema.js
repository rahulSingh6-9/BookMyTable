import { z } from "zod";

// ──────────────────────────────────────────────
// UNIFIED RESTAURANT SCHEMA (Frontend + Backend)
// ──────────────────────────────────────────────


export const step0Schema = z.discriminatedUnion("onboardingMode", [
  z.object({
    onboardingMode: z.literal("create_brand"),
    brandName: z.string().min(2, "Brand name is required").max(100),
    brandDescription: z.string().max(1000).optional(),
    brandLogo: z.string().optional(),
  }),
  z.object({
    onboardingMode: z.literal("add_branch"),
    selectedBrandId: z.string().min(1, "Please select a brand"),
  }),
  z.object({
    onboardingMode: z.literal("skip"),
  }),
]);

export const step1Schema = z.object({
  restaurantName: z.string().min(3, "Restaurant name is required"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens")
    .refine(s => !s.startsWith("-") && !s.endsWith("-"), "Slug cannot start or end with a hyphen"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priceRange: z.string().min(1, "Select price range"),
  cuisines: z.array(z.string()).min(1, "Select at least one cuisine"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
  isManualSlug: z.boolean().default(false),
});

export const step2Schema = z.object({
  addressLine1: z.string().min(5, "Address Line 1 must be at least 5 characters"),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const step3Schema = z.object({
  contactInfo: z.object({
    primaryPhone: z.object({
      countryCode: z.string().min(1),
      number: z.string().min(10, "Phone number is required"),
      e164: z.string().min(10, "Invalid phone format"),
      isVerified: z.boolean().default(false),
    }),
    alternatePhone: z.object({
      countryCode: z.string().optional(),
      number: z.string().optional(),
      e164: z.string().optional(),
    }).optional(),
    businessEmail: z.object({
      value: z.string().email("Invalid email address"),
      isVerified: z.boolean().default(false),
    }),
    supportEmail: z.string().email("Invalid support email").optional().or(z.literal("")),
    website: z.string().url("Invalid website URL").optional().or(z.literal("")),
    socialLinks: z.object({
      instagram: z.string().optional(),
    }).optional(),
  }),
});

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const daySchema = z.object({
  isClosed: z.boolean(),
  open: z.string().optional(),
  close: z.string().optional(),
  breaks: z.array(
    z.object({
      start: z.string().regex(timeRegex, "Invalid time format"),
      end: z.string().regex(timeRegex, "Invalid time format")
    })
  ).default([])
}).refine(data => {
  if (data.isClosed) return true;
  return data.open && timeRegex.test(data.open) && data.close && timeRegex.test(data.close);
}, { message: "Open and close times are required when not closed" });

export const step5Schema = z.object({
  hours: z.object({
    mon: daySchema,
    tue: daySchema,
    wed: daySchema,
    thu: daySchema,
    fri: daySchema,
    sat: daySchema,
    sun: daySchema
  })
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