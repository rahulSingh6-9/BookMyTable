import Restaurant from "../../models/restaurant.model.js";

export const fetchAllRestaurantsForAdmin = async ({ page = 1, limit = 100 } = {}) => {
  try {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 500) : 100;
    const skip = (safePage - 1) * safeLimit;

    const docs = await Restaurant.find()
      .sort({ _id: 1 })   // stable pagination
      .skip(skip)
      .limit(safeLimit + 1)
      .lean();

    const hasMore = docs.length > safeLimit;
    const restaurants = hasMore ? docs.slice(0, safeLimit) : docs;

    return {
      data: restaurants,
      page: safePage,
      limit: safeLimit,
      hasMore,
    };
  } catch (error) {
    throw new Error(`Failed to fetch restaurants: ${error.message}`);
  }
};