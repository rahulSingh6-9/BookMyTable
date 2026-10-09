import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import * as controller from "./subscription.controller.js";

const router = express.Router();

// Helper middleware to verify admin role
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

// Public plans route (unauthenticated)
router.get("/public/plans", controller.getPublicPlans);

// Public/Brand user actions (Protected by token verification)
router.get("/my-subscription", protect, controller.getMySubscription);
router.get("/my-usage", protect, controller.getMyUsage);
router.get("/my-features", protect, controller.getMyFeatures);

router.get("/plans", protect, controller.getPlans);
router.get("/plans/:id", protect, controller.getPlanById);
router.get("/brands/:brandId/active", protect, controller.getActiveSub);
router.post("/brands/:brandId/ensure", protect, controller.getOrCreateSub);

// Admin-only actions
router.post("/plans", protect, verifyAdmin, controller.createPlan);
router.put("/plans/:id", protect, verifyAdmin, controller.updatePlan);
router.put("/plans/:id/archive", protect, verifyAdmin, controller.archivePlan);
router.put("/plans/:id/restore", protect, verifyAdmin, controller.restorePlan);
router.post("/overrides", protect, verifyAdmin, controller.applyOverride);

export default router;

