import express from "express";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminAuditLogs,
} from "./management.controller.js";
import { protect, requireRole, requirePermission } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

router.use(protect);
router.use(requireRole(["super_admin", "SUPER_ADMIN", "admin"]));

router.get("/admins", requirePermission(PERMISSIONS.USERS_VIEW), getAdmins);
router.post("/admins", requirePermission(PERMISSIONS.USERS_INVITE), createAdmin);
router.put("/admins/:id", requirePermission(PERMISSIONS.USERS_EDIT), updateAdmin);
router.delete("/admins/:id", requirePermission(PERMISSIONS.USERS_BLOCK), deleteAdmin);

router.get("/audit-logs", requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS), getAdminAuditLogs);

export default router;
