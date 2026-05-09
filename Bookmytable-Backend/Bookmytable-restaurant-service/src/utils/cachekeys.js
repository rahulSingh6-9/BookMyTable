export const getStaffCacheKey = (userId, restaurantId) =>
  `staff:${userId}:${restaurantId}`;