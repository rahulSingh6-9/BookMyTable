import express from "express";
import { getAuditLogs, getSystemLogs } from "./adminLog.controller.js";
import { protect, requirePermission } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/audit-logs", requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW), getAuditLogs);
router.get("/system-logs", requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW), getSystemLogs);

export default router;
