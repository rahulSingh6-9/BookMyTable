import Restaurant from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import { syncRestaurantToDiscovery } from "../discovery/discovery.service.js";

const syncCQRS = async (restaurantId) => {
  try {
    await syncRestaurantToDiscovery(restaurantId);
  } catch (err) {
    console.error("Discovery sync error in settings:", err.message);
  }
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
