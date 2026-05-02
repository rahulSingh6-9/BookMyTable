import apiClient from "../lib/api";

/**
 * 🔥 GET FULL AVAILABILITY SETTINGS
 */
export const getAvailabilitySettings = async (restaurantId) => {
  return await apiClient.get(`/availability/${restaurantId}`);
};

/**
 * 🔥 UPDATE WEEKLY SCHEDULE (openingHours)
 */
export const updateSchedule = async (restaurantId, data) => {
  return await apiClient.patch(
    `/availability/${restaurantId}/schedule`,
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
    `/availability/${restaurantId}/slot-config`,
    data
  );
};

/**
 * 🔥 ADD EXCEPTION (SPECIAL DAY)
 */
export const addException = async (restaurantId, data) => {
  return await apiClient.post(
    `/availability/${restaurantId}/exceptions`,
    data
  );
};

/**
 * 🔥 DELETE EXCEPTION
 */
export const deleteException = async (restaurantId, date) => {
  return await apiClient.delete(
    `/availability/${restaurantId}/exceptions/${date}`
  );
};