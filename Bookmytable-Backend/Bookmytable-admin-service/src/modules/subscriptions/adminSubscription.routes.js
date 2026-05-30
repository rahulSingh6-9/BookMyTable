import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import * as controller from "./adminSubscription.controller.js";

const router = express.Router();

// Helper middleware to verify admin roles
const verifyAdmin = (req, res, next) => {
  const roles = req.user?.roles || [];
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Platform Administrator privileges required",
    });
  }
  next();
};

router.get("/plans", protect, verifyAdmin, controller.getPlans);
router.get("/active", protect, verifyAdmin, controller.getActiveSubscriptions);
router.get("/billing", protect, verifyAdmin, controller.getBillingHistory);
router.get("/overrides", protect, verifyAdmin, controller.getOverridesHistory);
router.get("/stats", protect, verifyAdmin, controller.getDashboardStats);

router.post("/plans", protect, verifyAdmin, controller.createPlan);
router.put("/plans/:id", protect, verifyAdmin, controller.updatePlan);
router.post("/overrides", protect, verifyAdmin, controller.applyOverride);

export default router;
