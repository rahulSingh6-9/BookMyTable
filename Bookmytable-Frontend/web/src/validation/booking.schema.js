import { z } from "zod";

// ──────────────────────────────────────────────
// BOOKING: create a table reservation
// ──────────────────────────────────────────────
export const createBookingSchema = z.object({
  restaurantId: z
    .string()
    .min(1, "Restaurant ID is required"),

  tableId: z
    .string()
    .min(1, "Table ID is required"),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must be in YYYY-MM-DD format"
    ),

  time: z
    .string()
    .regex(
      /^\d{2}:\d{2}$/,
      "Time must be in HH:MM format"
    ),

  guests: z
    .number()
    .int()
    .min(1, "At least 1 guest required")
    .max(100, "Cannot book for more than 100 guests"),

  specialRequest: z
    .string()
    .max(500, "Special request must be under 500 characters")
    .optional(),
});

// ──────────────────────────────────────────────
// BOOKING: update status (owner/admin use)
// ──────────────────────────────────────────────
export const updateBookingStatusSchema = z.object({
  status: z.enum(
    ["pending", "confirmed", "cancelled", "no-show", "completed"],
    { errorMap: () => ({ message: "Invalid booking status" }) }
  ),
});
