/**
 * Standardized event builders for Restaurant Service
 */

export const RestaurantEvents = {
  restaurantCreated: (restaurant, ownerId) => ({
    eventType: "RESTAURANT_CREATED",
    action: "CREATED",
    payload: {
      id: restaurant._id.toString(),
      name: restaurant.name,
      owner: ownerId.toString(),
      status: restaurant.status,
      city: restaurant.city,
      cuisine: restaurant.cuisine,
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt,
    },
    timestamp: Date.now(),
    version: 1,
  }),

  restaurantUpdated: (restaurant, action, adminId = null) => ({
    eventType: "RESTAURANT_UPDATED",
    action, // e.g., "STATUS_CHANGED", "DETAILS_UPDATED"
    payload: {
      id: restaurant._id.toString(),
      name: restaurant.name,
      owner: restaurant.owner?._id?.toString() || restaurant.owner?.toString(),
      ownerEmail: restaurant.owner?.email || restaurant.contact?.email,
      status: restaurant.status,
      city: restaurant.city,
      cuisine: restaurant.cuisine,
      isActive: restaurant.isActive,
    },
    adminId,
    timestamp: Date.now(),
    version: 1,
  }),
};
