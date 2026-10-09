import { 
  fetchAllRestaurantsForAdmin,
  fetchAllBrandsForAdmin,
  fetchAllBranchesForAdmin,
  fetchAllMembershipsForAdmin 
} from "./admin.service.js";

const handleExportRequest = async (req, res, fetchFn) => {
  try {
    const { page, limit } = req.query;
    const result = await fetchFn({ page, limit });

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

export const getAllRestaurantsForAdmin = (req, res) => handleExportRequest(req, res, fetchAllRestaurantsForAdmin);
export const getAllBrandsForAdmin = (req, res) => handleExportRequest(req, res, fetchAllBrandsForAdmin);
export const getAllBranchesForAdmin = (req, res) => handleExportRequest(req, res, fetchAllBranchesForAdmin);
export const getAllMembershipsForAdmin = (req, res) => handleExportRequest(req, res, fetchAllMembershipsForAdmin);