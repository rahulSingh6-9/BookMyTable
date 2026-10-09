import express from "express";
import adminUserRoutes from "./users/adminUser.routes.js";
import adminRestaurantRoutes from "./restaurants/adminRestaurant.routes.js";
import adminBrandRoutes from "./brands/adminBrand.routes.js";
import adminDiscoveryRoutes from "./discovery/adminDiscovery.routes.js";
import adminInvitationRoutes from "./invitation/adminInvitation.routes.js";
import adminSubscriptionRoutes from "./subscriptions/adminSubscription.routes.js";
import adminModerationRoutes from "./moderation/adminModeration.routes.js";
import adminManagementRoutes from "./management/management.routes.js";
import adminLogRoutes from "./logs/adminLog.routes.js";
import adminExportRoutes from "./admin.routes.js";

const router = express.Router();

router.use("/users", adminUserRoutes);
router.use("/restaurants", adminRestaurantRoutes);
router.use("/brands", adminBrandRoutes);
router.use("/discovery", adminDiscoveryRoutes);
router.use("/invitations", adminInvitationRoutes);
router.use("/subscriptions", adminSubscriptionRoutes);
router.use("/moderation", adminModerationRoutes);
router.use("/management", adminManagementRoutes);
router.use("/logs", adminLogRoutes);
router.use("/", adminExportRoutes);

export default router;

