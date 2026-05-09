import { fetchAllRestaurantsForAdmin } from "./admin.service.js";

export const getAllRestaurantsForAdmin = async (req, res) => {
  try {
    const { page, limit } = req.query;

    const result = await fetchAllRestaurantsForAdmin({ page, limit });

    res.json({
      success: true,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};