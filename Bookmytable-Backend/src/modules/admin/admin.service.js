import Restaurant from "../../models/restaurant.model.js";
import Brand from "../../models/brand.model.js";
import RestaurantBranch from "../../models/restaurant.model.js"; // In this project, restaurant.model exports RestaurantBranch
import BranchMembership from "../../models/branchmemberships.model.js";

// Generic fetcher for pagination
const fetchPagedData = async (Model, { page = 1, limit = 100 } = {}) => {
  try {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 500) : 100;
    const skip = (safePage - 1) * safeLimit;

    const docs = await Model.find()
      .sort({ _id: 1 })
      .skip(skip)
      .limit(safeLimit + 1)
      .lean();

    const hasMore = docs.length > safeLimit;
    const data = hasMore ? docs.slice(0, safeLimit) : docs;

    return {
      data,
      page: safePage,
      limit: safeLimit,
      hasMore,
    };
  } catch (error) {
    console.error(`❌ [Admin Service Export] Error fetching ${Model.modelName}:`, error);
    throw error;
  }
};

export const fetchAllRestaurantsForAdmin = (params) => fetchPagedData(Restaurant, params);
export const fetchAllBrandsForAdmin = (params) => fetchPagedData(Brand, params);
export const fetchAllBranchesForAdmin = (params) => fetchPagedData(RestaurantBranch, params);
export const fetchAllMembershipsForAdmin = (params) => fetchPagedData(BranchMembership, params);