import express from "express";

// Route modules
import authRoutes from "../modules/auth/auth.routes.js";
import verificationRoutes from "../modules/verification/verification.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import discoveryRoutes from "../modules/discovery/discovery.routes.js";
import bookingRoutes from "../modules/booking/booking.routes.js";
import membershipRoutes from "../modules/membership/membership.routes.js";
import subscriptionRoutes from "../modules/subscriptions/subscription.routes.js";
import restaurantRoutes from "../modules/restaurant/restaurant.routes.js";
import brandRoutes from "../modules/brand/brand.routes.js";
import tableRoutes from "../modules/table/table.routes.js";
import layoutRoutes from "../modules/layout/layout.route.js";
import menuCategoryRoutes from "../modules/menu-category/menuCategory.routes.js";
import menuItemRoutes from "../modules/menu-item/menuItem.routes.js";
import availabilityRoutes from "../modules/availability/availability.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import onboardingRoutes from "../modules/onboarding/onboarding.routes.js";
import businessWorkspaceRoutes from "../modules/businessWorkspace/businessWorkspace.routes.js";
import logRoutes from "../modules/log/log.routes.js";
import pricingRoutes from "../modules/pricing/pricing.routes.js";
import staffRoutes from "../modules/staff/staff.routes.js";
import aiRoutes from "../modules/ai/routes/ai.routes.js";
import paymentRoutes from "../modules/payments/payment.routes.js";
import adminRoutes from "../modules/admin/index.routes.js";

// Specific public controllers
import { validateInviteController, acceptInviteController } from "../modules/staff/staff.controller.js";
import { optionalProtect } from "../middleware/auth.middleware.js";
import { getPlans } from "../modules/subscriptions/subscription.service.js";

const router = express.Router();

// ──────────────────────────────────────────────
// PUBLIC & DISCOVERY ROUTES
// ──────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/verification", verificationRoutes);
router.use("/discovery", discoveryRoutes);

// Public Subscription Plans (for pricing page / onboarding)
router.get("/restaurants/subscriptions/public/plans", async (req, res) => {
  try {
    const plans = await getPlans({ isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
router.get("/subscriptions/public/plans", async (req, res) => {
  try {
    const plans = await getPlans({ isActive: true });
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Staff Public Invite Flows
router.get("/staff/invite/validate", validateInviteController);
router.post("/staff/accept-invite", optionalProtect, acceptInviteController);

// ──────────────────────────────────────────────
// CORE DOMAIN & PARTNER ROUTES
// ──────────────────────────────────────────────
router.use("/users", userRoutes);
router.use("/memberships", membershipRoutes);
router.use("/booking", bookingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);
router.use("/restaurants/subscriptions", subscriptionRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/restaurants", restaurantRoutes);
router.use("/brands", brandRoutes);
router.use("/tables", tableRoutes);
router.use("/layouts", layoutRoutes);
router.use("/menu-categories", menuCategoryRoutes);
router.use("/menu-items", menuItemRoutes);
router.use("/availability", availabilityRoutes);
router.use("/settings", settingsRoutes);
router.use("/onboarding", onboardingRoutes);
router.use("/business-workspace", businessWorkspaceRoutes);
router.use("/logs", logRoutes);
router.use("/pricing", pricingRoutes);
router.use("/staff", staffRoutes);
router.use("/ai", aiRoutes);

// ──────────────────────────────────────────────
// ADMIN MASTER ROUTER
// ──────────────────────────────────────────────
router.use("/admin", adminRoutes);

export default router;
