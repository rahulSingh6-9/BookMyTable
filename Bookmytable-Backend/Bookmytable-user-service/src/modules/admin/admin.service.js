import User from "../../models/user.model.js";


export const fetchAllUsersForAdmin = async ({ page = 1, limit = 100 } = {}) => {
  try {
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const safeLimit = Number(limit) > 0 ? Math.min(Number(limit), 500) : 100;
    const skip = (safePage - 1) * safeLimit;

    // Fetch one extra doc to compute hasMore without an expensive count().
    const docs = await User.find()
      .select("-password")
      .sort({ _id: 1 })
      .skip(skip)
      .limit(safeLimit + 1)
      .lean();

    const hasMore = docs.length > safeLimit;
    const users = hasMore ? docs.slice(0, safeLimit) : docs;

    return {
      data: users,
      page: safePage,
      limit: safeLimit,
      hasMore,
    };
  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};