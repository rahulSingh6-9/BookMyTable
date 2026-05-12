import crypto from "crypto";
/**
 * Standardized event builders for Restaurant Service
 */

export const RestaurantEvents = {
  restaurantCreated: (restaurant, ownerId) => ({
    eventType: "RESTAURANT_CREATED",
    action: "CREATED",
    payload: {
      id: restaurant._id.toString(),
      brandId: restaurant.brandId?.toString(),
      branchName: restaurant.branchName,
      branchCode: restaurant.branchCode,
      owner: ownerId.toString(),
      status: restaurant.status,
      city: restaurant.address?.city,
      address: restaurant.address?.addressLine1,
      isActive: restaurant.isActive,
      createdAt: restaurant.createdAt,
    },
    timestamp: Date.now(),
    version: 1,
  }),

  restaurantUpdated: (restaurant, action, metadata = {}) => {
    const { correlationId, tenantContext, actorId } = restaurant;
    
    return {
      id: crypto.randomUUID(),
      source: "restaurant-service",
      type: "com.bookmytable.restaurant.updated",
      action,
      correlationId: correlationId || metadata.correlationId,
      actorId: actorId || metadata.adminId,
      context: tenantContext || metadata.context,
      payload: {
        id: restaurant._id?.toString() || restaurant.id,
        brandId: restaurant.brandId?.toString(),
        branchName: restaurant.branchName,
        branchCode: restaurant.branchCode,
        owner: restaurant.owner?._id?.toString() || restaurant.owner?.toString() || restaurant.owner,
        ownerEmail: restaurant.owner?.email || restaurant.contact?.email,
        status: restaurant.status,
        city: restaurant.address?.city,
        address: restaurant.address?.addressLine1,
        isActive: restaurant.isActive,
      },
      timestamp: Date.now(),
      version: 1,
    };
  },
};
