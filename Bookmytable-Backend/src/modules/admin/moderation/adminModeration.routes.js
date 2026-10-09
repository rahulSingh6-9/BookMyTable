import express from "express";
import { getApprovalQueue, getVerifications } from "./adminModeration.controller.js";
import { protect, requirePermission } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/approvals", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getApprovalQueue);
router.get("/verifications", requirePermission(PERMISSIONS.USERS_VIEW), getVerifications);

export default router;
