import { useState, useCallback } from "react";
import { restaurantSettings, DAYS_OF_WEEK } from "@/lib/mockData";

const defaultOpeningHours = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [day, { isOpen: false, slots: [] }])
);

export function useRestaurantSettings(restaurantId = "1") {
  const initial = restaurantSettings[restaurantId] || {
    openingHours: defaultOpeningHours,
    specialDays: [],
    timeSlotInterval: 30,
    minGuestsPerBooking: 1,
    maxGuestsPerBooking: 10,
    advanceBookingDays: 30,
    cancellationPolicy: "",
    autoAcceptBookings: true,
    depositRequired: false,
    depositAmount: 0,
  };

  const [settings, setSettings] = useState(initial);

  const updateOpeningHours = useCallback((day, data) => {
    setSettings((prev) => ({
      ...prev,
      openingHours: { ...prev.openingHours, [day]: { ...prev.openingHours[day], ...data } },
    }));
  }, []);

  const addSlot = useCallback((day) => {
    setSettings((prev) => {
      const dayData = prev.openingHours[day];
      return {
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: { ...dayData, slots: [...dayData.slots, { open: "09:00", close: "17:00" }] },
        },
      };
    });
  }, []);

  const removeSlot = useCallback((day, index) => {
    setSettings((prev) => {
      const dayData = prev.openingHours[day];
      return {
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [day]: { ...dayData, slots: dayData.slots.filter((_, i) => i !== index) },
        },
      };
    });
  }, []);

  const updateSlot = useCallback((day, index, field, value) => {
    setSettings((prev) => {
      const dayData = prev.openingHours[day];
      const newSlots = dayData.slots.map((s, i) => (i === index ? { ...s, [field]: value } : s));
      return {
        ...prev,
        openingHours: { ...prev.openingHours, [day]: { ...dayData, slots: newSlots } },
      };
    });
  }, []);

  const addSpecialDay = useCallback((specialDay) => {
    setSettings((prev) => ({
      ...prev,
      specialDays: [...prev.specialDays, specialDay],
    }));
  }, []);

  const removeSpecialDay = useCallback((index) => {
    setSettings((prev) => ({
      ...prev,
      specialDays: prev.specialDays.filter((_, i) => i !== index),
    }));
  }, []);

  const updateField = useCallback((field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    settings,
    updateOpeningHours,
    addSlot,
    removeSlot,
    updateSlot,
    addSpecialDay,
    removeSpecialDay,
    updateField,
  };
}
