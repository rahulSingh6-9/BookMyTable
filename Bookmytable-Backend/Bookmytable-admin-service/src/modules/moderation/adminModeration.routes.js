import express from "express";
import { getApprovalQueue, getVerifications } from "./adminModeration.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect); // All routes protected

router.get("/queue", getApprovalQueue);
router.get("/verifications", getVerifications);

export default router;
