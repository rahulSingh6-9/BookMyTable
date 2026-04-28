import { DAYS_OF_WEEK } from "../config/constants.js";

// ──────────────────────────────────────────────
// Time Slot Generation
// Extracted from web/src/hooks/useAvailableSlots.js
// ──────────────────────────────────────────────

/**
 * Generate time slot strings between two times at a given interval.
 * @param {string} openTime  - "HH:MM"
 * @param {string} closeTime - "HH:MM"
 * @param {number} intervalMinutes - e.g. 30
 * @returns {string[]} - e.g. ["09:00", "09:30", "10:00", ...]
 */
export function generateTimeSlots(openTime, closeTime, intervalMinutes = 30) {
  const slots = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  let current = openH * 60 + openM;
  const end = closeH * 60 + closeM;

  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += intervalMinutes;
  }

  return slots;
}

/**
 * Filter out time slots that are in the past for the current day.
 * If the selected date is NOT today, returns all slots unchanged.
 * @param {string[]} slots    - array of "HH:MM" strings
 * @param {string} selectedDate - "YYYY-MM-DD"
 * @returns {string[]}
 */
export function filterPastSlots(slots, selectedDate) {
  const today = new Date().toISOString().split("T")[0];

  if (selectedDate !== today) return slots;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.filter((slot) => {
    const [h, m] = slot.split(":").map(Number);
    return h * 60 + m > currentMinutes;
  });
}

/**
 * Given restaurant settings and a selected date,
 * compute the available time slots for that day.
 *
 * Checks special days first, falls back to regular opening hours.
 *
 * @param {object} settings - restaurant settings with openingHours, specialDays, timeSlotInterval
 * @param {string} selectedDate - "YYYY-MM-DD"
 * @returns {{ slots: string[], isClosed: boolean }}
 */
export function getAvailableSlots(settings, selectedDate) {
  if (!settings || !selectedDate) {
    return { slots: [], isClosed: true };
  }

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dayIndex = dateObj.getDay(); // 0 = Sunday
  // Map JS getDay to our DAYS_OF_WEEK array (Mon=0 … Sun=6)
  const dayName = DAYS_OF_WEEK[dayIndex === 0 ? 6 : dayIndex - 1];
  const interval = settings.timeSlotInterval ?? 30;

  // ── Special day override ──────────────────
  const special = settings.specialDays?.find((s) => s.date === selectedDate);
  if (special) {
    if (special.isOpen === false) return { slots: [], isClosed: true };
    if (special.slots) {
      const allSlots = special.slots.flatMap((s) =>
        generateTimeSlots(s.open, s.close, interval)
      );
      return { slots: filterPastSlots(allSlots, selectedDate), isClosed: false };
    }
  }

  // ── Regular schedule ──────────────────────
  const daySchedule = settings.openingHours?.[dayName];
  if (!daySchedule?.isOpen) return { slots: [], isClosed: true };

  const allSlots = (daySchedule.slots ?? []).flatMap((s) =>
    generateTimeSlots(s.open, s.close, interval)
  );

  return { slots: filterPastSlots(allSlots, selectedDate), isClosed: false };
}
