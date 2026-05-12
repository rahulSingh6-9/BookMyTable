import * as managementService from "./management.service.js";
import { createAdminLog } from "../../services/adminLog.service.js";

export const getAdmins = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await managementService.listAdmins({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { userId, email, roles, customPermissions } = req.body;
    const admin = await managementService.createAdmin({
      userId,
      email,
      roles,
      customPermissions,
      createdBy: req.user.id,
    });

    await createAdminLog({
      adminId: req.user.id,
      action: "ADMIN_CREATED",
      targetType: "admin",
      targetId: admin._id,
      metadata: { roles, email },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const admin = await managementService.updateAdmin(id, updates);

    await createAdminLog({
      adminId: req.user.id,
      action: "ADMIN_UPDATED",
      targetType: "admin",
      targetId: id,
      metadata: updates,
      ipAddress: req.ip,
    });

    res.json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await managementService.deleteAdmin(id);

    await createAdminLog({
      adminId: req.user.id,
      action: "ADMIN_DELETED",
      targetType: "admin",
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: "Admin removed" });
  } catch (error) {
    next(error);
  }
};

export const getAdminAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, adminId, action } = req.query;
    const logs = await managementService.getAuditLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      adminId,
      action,
    });
    res.json({ success: true, ...logs });
  } catch (error) {
    next(error);
  }
};
