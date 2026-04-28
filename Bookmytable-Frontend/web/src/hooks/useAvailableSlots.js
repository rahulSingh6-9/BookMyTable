import { useMemo } from "react";
import { getAvailableSlots } from "../utils/timeSlots.js";

// ──────────────────────────────────────────────
// Hook: useAvailableSlots
// Computes available booking time slots for a given date,
// using shared getAvailableSlots utility from ../utils/timeSlots.js
// ──────────────────────────────────────────────

/**
 * @param {object} settings - restaurant settings (openingHours, specialDays, timeSlotInterval)
 * @param {string} selectedDate - "YYYY-MM-DD"
 * @returns {{ slots: string[], isClosed: boolean }}
 */
export function useAvailableSlots(settings, selectedDate) {
  return useMemo(
    () => getAvailableSlots(settings, selectedDate),
    [settings, selectedDate]
  );
}
