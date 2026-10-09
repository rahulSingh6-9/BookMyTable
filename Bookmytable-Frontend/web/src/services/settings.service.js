import apiClient from "../lib/api";

/**
 * 🔥 GET FULL AVAILABILITY SETTINGS
 */
export const getAvailabilitySettings = async (restaurantId) => {
  return await apiClient.get(`/settings/${restaurantId}`);
};

/**
 * 🔥 UPDATE WEEKLY SCHEDULE (openingHours)
 */
export const updateSchedule = async (restaurantId, data) => {
  return await apiClient.patch(
    `/settings/${restaurantId}/schedule`,
    {
      openingHours: data,
    }
  );
};

/**
 * 🔥 UPDATE SLOT CONFIG (interval + duration)
 */
export const updateSlotConfig = async (restaurantId, data) => {
  return await apiClient.patch(
    `/settings/${restaurantId}/slot-config`,
    data
  );
};

/**
 * 🔥 ADD EXCEPTION (SPECIAL DAY)
 */
export const addException = async (restaurantId, data) => {
  return await apiClient.post(
    `/settings/${restaurantId}/special-days`,
    data
  );
};

/**
 * 🔥 DELETE EXCEPTION
 */
export const deleteException = async (restaurantId, date) => {
  return await apiClient.delete(
    `/settings/${restaurantId}/special-days/${date}`
  );
};

/**
 * 🔥 UPDATE BOOKING POLICIES
 */
export const updateBookingPolicies = async (restaurantId, data) => {
  return await apiClient.patch(
    `/settings/${restaurantId}/booking-policies`,
    data
  );
};