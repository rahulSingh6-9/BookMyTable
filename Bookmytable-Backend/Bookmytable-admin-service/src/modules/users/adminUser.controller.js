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
