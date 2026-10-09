import express from "express";
import { protect, requirePermission } from "../../../middleware/auth.middleware.js";
import {
  getPlans,
  getActiveSubscriptions,
  getBillingHistory,
  getOverridesHistory,
  getDashboardStats,
  createPlan,
  updatePlan,
  archivePlan,
  restorePlan,
  applyOverride
} from "./adminSubscription.controller.js";
import { PERMISSIONS } from "../../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS), getDashboardStats);
router.get("/plans", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getPlans);
router.post("/plans", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), createPlan);
router.put("/plans/:id", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), updatePlan);
router.put("/plans/:id/archive", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), archivePlan);
router.put("/plans/:id/restore", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), restorePlan);

router.get("/active", requirePermission(PERMISSIONS.RESTAURANTS_VIEW), getActiveSubscriptions);
router.get("/billing", requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS), getBillingHistory);
router.get("/overrides", requirePermission(PERMISSIONS.SYSTEM_VIEW_LOGS), getOverridesHistory);
router.post("/overrides", requirePermission(PERMISSIONS.RESTAURANTS_EDIT), applyOverride);

export default router;
