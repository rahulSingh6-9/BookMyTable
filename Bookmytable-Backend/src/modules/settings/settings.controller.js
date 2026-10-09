import * as SettingsService from "./settings.service.js";

/**
 * GET SETTINGS
 */
export const getSettingsController = async (req, res) => {
  try {
    const data = await SettingsService.getSettings(req.params.restaurantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * UPDATE SCHEDULE
 */
export const updateScheduleController = async (req, res) => {
  try {
    const data = await SettingsService.updateSchedule(
      req.params.restaurantId,
      req.body.openingHours
    );

    res.json({ message: "Schedule updated", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * UPDATE SLOT CONFIG
 */
export const updateSlotConfigController = async (req, res) => {
  try {
    const data = await SettingsService.updateSlotConfig(
      req.params.restaurantId,
      req.body
    );

    res.json({ message: "Slot config updated", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * ADD SPECIAL DAY
 */
export const addSpecialDayController = async (req, res) => {
  try {
    const data = await SettingsService.addSpecialDay(
      req.params.restaurantId,
      req.body
    );

    res.json({ message: "Special day added", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE SPECIAL DAY
 */
export const deleteSpecialDayController = async (req, res) => {
  try {
    const data = await SettingsService.deleteSpecialDay(
      req.params.restaurantId,
      req.params.date
    );

    res.json({ message: "Special day removed", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * UPDATE BOOKING POLICIES
 */
export const updateBookingPoliciesController = async (req, res) => {
  try {
    const data = await SettingsService.updateBookingPolicies(
      req.params.restaurantId,
      req.body
    );

    res.json({ message: "Booking policies updated", data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
