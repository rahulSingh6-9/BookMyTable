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
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      images: restaurant.images || [],
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
    
    // Resolve owner info safely from populated ownerId
    const ownerObj = restaurant.ownerId || {};

    return {
      id: crypto.randomUUID(),
      source: "restaurant-service",
      type: "com.bookmytable.restaurant.updated",
      eventType: "RESTAURANT_UPDATED",
      action,
      correlationId: correlationId || metadata.correlationId,
      actorId: actorId || metadata.adminId,
      context: tenantContext || metadata.context,
      payload: {
        id: restaurant._id?.toString() || restaurant.id,
        branchId: restaurant._id?.toString() || restaurant.id,
        brandId: restaurant.brandId?.toString(),
        branchName: restaurant.branchName,
        branchCode: restaurant.branchCode,
        status: restaurant.status,
        logo: restaurant.logo || "",
        coverImage: restaurant.coverImage || "",
        images: restaurant.images || [],
        
        // Structured owner info for notifications
        owner: {
          id: ownerObj._id?.toString() || ownerObj.id || restaurant.ownerId,
          name: ownerObj.name || "Owner",
          email: ownerObj.email || restaurant.contact?.email
        },
        
        // Legacy support
        ownerEmail: ownerObj.email || restaurant.contact?.email,
        
        city: restaurant.address?.city,
        address: restaurant.address?.addressLine1,
        isActive: restaurant.isActive,
        updatedAt: restaurant.updatedAt || new Date(),
      },
      timestamp: Date.now(),
      version: 1,
    };
  },
};
