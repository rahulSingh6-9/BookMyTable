import Restaurant from "../models/restaurant.model.js";
import RestaurantSettings from "../models/restaurantSettings.model.js";

/**
 * 🔥 GET SETTINGS
 */
export const getSettings = async (restaurantId) => {
  const [restaurant, settings] = await Promise.all([
    Restaurant.findById(restaurantId),
    RestaurantSettings.findOne({ restaurant: restaurantId }),
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
  console.log("Incoming openingHours:", JSON.stringify(openingHours, null, 2));

  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: { openingHours } },
    { new: true, runValidators: true }
  );

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  return restaurant.openingHours;
};

/**
 * 🔥 UPDATE SLOT CONFIG
 */
export const updateSlotConfig = async (restaurantId, data) => {
  let settings = await RestaurantSettings.findOne({ restaurant: restaurantId });

  if (!settings) {
    settings = new RestaurantSettings({ restaurant: restaurantId });
  }

  settings.timeSlotInterval = data.timeSlotInterval ?? settings.timeSlotInterval;
  settings.slotDuration = data.slotDuration ?? settings.slotDuration;

  await settings.save();

  return settings;
};

/**
 * 🔥 ADD SPECIAL DAY
 */
export const addSpecialDay = async (restaurantId, specialDay) => {
  let settings = await RestaurantSettings.findOne({ restaurant: restaurantId });

  if (!settings) {
    settings = new RestaurantSettings({ restaurant: restaurantId });
  }

  settings.specialDays.push(specialDay);
  await settings.save();

  return settings.specialDays;
};

/**
 * 🔥 DELETE SPECIAL DAY
 */
export const deleteSpecialDay = async (restaurantId, date) => {
  let settings = await RestaurantSettings.findOne({ restaurant: restaurantId });

  if (!settings) {
    settings = new RestaurantSettings({ restaurant: restaurantId });
  }

  settings.specialDays = settings.specialDays.filter(
    (d) => new Date(d.date).toISOString() !== new Date(date).toISOString()
  );

  await settings.save();

  return settings.specialDays;
};