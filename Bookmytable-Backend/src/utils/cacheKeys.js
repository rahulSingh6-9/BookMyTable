export const getStaffCacheKey = (userId, branchId) => `staff:${userId}:${branchId}`;
export const getRestaurantCacheKey = (branchId) => `restaurant:${branchId}`;
export const getUserCacheKey = (userId) => `user:${userId}`;
