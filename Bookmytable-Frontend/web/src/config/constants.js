// ──────────────────────────────────────────────
// Shared constants — moved from web/src/lib/mockData.js
// ──────────────────────────────────────────────

// Days of the week (used in availability / opening hours)
export const DAYS_OF_WEEK = Object.freeze([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Table types (used in table management UI and booking filters)
export const TABLE_TYPES = Object.freeze([
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "vip", label: "VIP" },
]);

// Valid booking status values
export const BOOKING_STATUSES = Object.freeze([
  "pending",
  "confirmed",
  "cancelled",
  "no-show",
  "completed",
]);

// Payment status values
export const PAYMENT_STATUSES = Object.freeze([
  "pending",
  "paid",
  "refunded",
  "failed",
]);

// Booking sources
export const BOOKING_SOURCES = Object.freeze([
  "app",
  "walk-in",
  "phone",
  "admin",
]);
