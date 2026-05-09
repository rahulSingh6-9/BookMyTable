import { fetchAllUsersForAdmin } from "./admin.service.js" 


export const getAllUsers = async (req, res, next) => {
   try{
    const result = await getAllUsersService()

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        count: result.length,
        data: result,
    })

   } catch(error) {
    next(error)
   }
}


export const getAllUsersForAdmin = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await fetchAllUsersForAdmin({
      page: Number(page) || 1,
      limit: Number(limit) || 100,
    });

    res.status(200).json({
      success: true,
      count: result.data.length,
      data: result.data,
      meta: {
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
