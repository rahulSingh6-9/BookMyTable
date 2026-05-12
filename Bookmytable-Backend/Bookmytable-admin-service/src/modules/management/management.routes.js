import express from "express";
import * as managementController from "./management.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { requireRole, requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS, ROLES } from "../../config/permissions.js";

const router = express.Router();

// All management routes are protected and require SUPER_ADMIN or ADMINS_MANAGE permission
router.use(protect);

router.get(
  "/", 
  requirePermission(PERMISSIONS.ADMINS_MANAGE), 
  managementController.getAdmins
);

router.post(
  "/", 
  requireRole([ROLES.SUPER_ADMIN]), 
  managementController.createAdmin
);

router.put(
  "/:id", 
  requireRole([ROLES.SUPER_ADMIN]), 
  managementController.updateAdmin
);

router.delete(
  "/:id", 
  requireRole([ROLES.SUPER_ADMIN]), 
  managementController.deleteAdmin
);

router.get(
  "/logs", 
  requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW), 
  managementController.getAdminAuditLogs
);

export default router;
