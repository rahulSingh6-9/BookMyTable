import Restaurant from "../models/restaurant.model.js"

export const getAllRestaurantsService = async ({ status } = {}) => {
    const filter = {};

    // Apply status filter only when a valid value is provided
    const VALID_STATUSES = ["pending", "approved", "suspended", "rejected"];
    if (status && VALID_STATUSES.includes(status)) {
        filter.status = status;
    }

    const restaurants = await Restaurant.find(filter)
        .populate("owner", "name email")
        .sort({ createdAt: -1 });

    console.log(`[AdminService] Restaurants from DB (filter: ${JSON.stringify(filter)}):`, restaurants.length);

    // Return a clean DTO — no raw Mongoose doc bloat sent to the client
    return restaurants.map((r) => ({
        id: r._id,
        name: r.name,
        owner: r.owner ? { id: r.owner._id, name: r.owner.name, email: r.owner.email } : null,
        status: r.status,
        city: r.city,
        cuisine: r.cuisine,
        rating: r.rating,
        isActive: r.isActive,
        createdAt: r.createdAt,
    }));
};

export const approveRestaurant = async (id) => {
  return Restaurant.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true }
  );
};

export const suspendRestaurant = async (id) => {
  return Restaurant.findByIdAndUpdate(
    id,
    { status: "suspended" },
    { new: true }
  );
};