import {
  exportUsersService,
  banUserService,
  unbanUserService,
  updateUserRoleService,
} from "./adminUser.service.js";

export const getAllUsersController = async (req, res) => {
  try {
    const { page, limit, search, status, role } = req.query;

    const result = await exportUsersService({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
      status,
      role,
    });
    console.log('getAllUsersController', result)

    res.json({
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: Number(page) || 1,
        pages: Math.ceil(result.total / (Number(limit) || 10)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await banUserService(id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await unbanUserService(id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const result = await updateUserRoleService(id, role, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserDetailsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Will be imported from service
    const { getUserDetailsService } = await import("./adminUser.service.js");
    const result = await getUserDetailsService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    if (error.message === "RESYNC_REQUIRED") {
      return res.status(404).json({ error: "RESYNC_REQUIRED", message: "Read model is missing or stale." });
    }
    next(error);
  }
};

export const getUserActivityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { getUserActivityService } = await import("./adminUser.service.js");
    const result = await getUserActivityService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserBookingsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { getUserBookingsService } = await import("./adminUser.service.js");
    const result = await getUserBookingsService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getUserRestaurantsController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { getUserRestaurantsService } = await import("./adminUser.service.js");
    const result = await getUserRestaurantsService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const forceLogoutController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { forceLogoutService } = await import("./adminUser.service.js");
    const result = await forceLogoutService(id, req.user);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
