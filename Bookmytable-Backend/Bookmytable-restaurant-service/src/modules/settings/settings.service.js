import crypto from "crypto";
import Restaurant from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import { emitRestaurantPartialUpdate } from "../../kafka/producers/restaurant.producer.js";

/**
 * 📊 Compute Summaries for CQRS Read Models
 */
const computeAvailabilitySummary = (restaurant, settings) => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = days[new Date().getDay()];
  const todaySchedule = restaurant?.openingHours?.[today];
  const isClosedToday = !todaySchedule || todaySchedule.isClosed;

  let isOpenNow = false;
  if (!isClosedToday && todaySchedule?.open != null && todaySchedule?.close != null) {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    if (currentMins >= todaySchedule.open && currentMins <= todaySchedule.close) {
      isOpenNow = true;
    }
    // Simple break logic could be added here
  }

  const minutesToTime = (mins) => {
    if (mins == null) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return {
    isOpenNow,
    todayOpeningTime: isClosedToday ? null : minutesToTime(todaySchedule?.open),
    todayClosingTime: isClosedToday ? null : minutesToTime(todaySchedule?.close),
    weeklyAvailabilitySummary: "Standard Schedule",
    acceptingReservations: settings?.autoAcceptBookings ?? false,
    hasExceptions: (settings?.specialDays?.length || 0) > 0,
    slotDuration: settings?.slotDuration || 60,
    availabilityUpdatedAt: new Date(),
  };
};

const computeBookingPolicySummary = (settings) => {
  return {
    bookingEnabled: true,
    minGuests: settings?.minGuestsPerBooking || 1,
    maxGuests: settings?.maxGuestsPerBooking || 10,
    advanceBookingDays: settings?.advanceBookingDays || 7,
    reservationBuffer: settings?.tableBufferMinutes || 15,
    instantBookingEnabled: settings?.autoAcceptBookings ?? true,
    lastPolicyUpdatedAt: new Date(),
  };
};

const syncCQRS = async (restaurantId) => {
  const [restaurant, settings] = await Promise.all([
    Restaurant.findById(restaurantId),
    RestaurantSettings.findOne({ branch: restaurantId }),
  ]);
  
  if (!restaurant || !settings) return;

  const availabilitySummary = computeAvailabilitySummary(restaurant, settings);
  const bookingPolicySummary = computeBookingPolicySummary(settings);

  await emitRestaurantPartialUpdate(
    restaurantId,
    restaurant.brandId,
    { 
      availabilitySummary, 
      bookingPolicySummary,
      openingHours: restaurant.openingHours,
      settings: settings.toObject ? settings.toObject() : settings
    },
    crypto.randomUUID(),
    restaurant.ownerId
  );
};

/**
 * 🔥 GET SETTINGS
 */
export const getSettings = async (restaurantId) => {
  const [restaurant, settings] = await Promise.all([
    Restaurant.findById(restaurantId),
    RestaurantSettings.findOne({ branch: restaurantId }),
  ]);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return {
    openingHours: restaurant.openingHours,
    settings,
  };
};

/**
 * 🔥 UPDATE SCHEDULE (openingHours)
 */
export const updateSchedule = async (restaurantId, openingHours) => {
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: { openingHours } },
    { new: true, runValidators: true }
  );

  if (!restaurant) throw new Error("Restaurant not found");
  await syncCQRS(restaurantId);

  return restaurant.openingHours;
};

/**
 * 🔥 UPDATE SLOT CONFIG
 */
export const updateSlotConfig = async (restaurantId, data) => {
  let settings = await RestaurantSettings.findOne({ branch: restaurantId });

  if (!settings) {
    const r = await Restaurant.findById(restaurantId);
    settings = new RestaurantSettings({ branch: restaurantId, brand: r?.brandId });
  }

  settings.timeSlotInterval = data.timeSlotInterval ?? settings.timeSlotInterval;
  settings.slotDuration = data.slotDuration ?? settings.slotDuration;

  await settings.save();
  await syncCQRS(restaurantId);

  return settings;
};

/**
 * 🔥 ADD SPECIAL DAY
 */
export const addSpecialDay = async (restaurantId, specialDay) => {
  let settings = await RestaurantSettings.findOne({ branch: restaurantId });

  if (!settings) {
    const r = await Restaurant.findById(restaurantId);
    settings = new RestaurantSettings({ branch: restaurantId, brand: r?.brandId });
  }

  settings.specialDays.push(specialDay);
  await settings.save();
  await syncCQRS(restaurantId);

  return settings.specialDays;
};

/**
 * 🔥 DELETE SPECIAL DAY
 */
export const deleteSpecialDay = async (restaurantId, date) => {
  let settings = await RestaurantSettings.findOne({ branch: restaurantId });

  if (!settings) return [];

  settings.specialDays = settings.specialDays.filter(
    (d) => new Date(d.date).toISOString() !== new Date(date).toISOString()
  );

  await settings.save();
  await syncCQRS(restaurantId);

  return settings.specialDays;
};

/**
 * 🔥 UPDATE BOOKING POLICIES
 */
export const updateBookingPolicies = async (restaurantId, data) => {
  let settings = await RestaurantSettings.findOne({ branch: restaurantId });

  if (!settings) {
    const r = await Restaurant.findById(restaurantId);
    settings = new RestaurantSettings({ branch: restaurantId, brand: r?.brandId });
  }

  const allowedFields = [
    "minGuestsPerBooking", "maxGuestsPerBooking", "advanceBookingDays",
    "cancellationPolicy", "autoAcceptBookings", "depositRequired",
    "depositAmount", "tableBufferMinutes", "minimumAdvanceNoticeMinutes",
    "cancellationAllowedBeforeMinutes"
  ];

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      settings[field] = data[field];
    }
  });

  await settings.save();
  await syncCQRS(restaurantId);

  return settings;
};