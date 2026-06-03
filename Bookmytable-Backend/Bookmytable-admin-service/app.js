import express from "express";
import cookieParser from "cookie-parser";

import adminRestaurantRoutes from "./src/modules/restaurants/adminRestaurant.routes.js";
import adminBrandRoutes from "./src/modules/brands/adminBrand.routes.js";
import adminLogRoutes from "./src/modules/logs/adminLog.routes.js";
import adminUserRoutes from "./src/modules/users/adminUser.routes.js";
import managementRoutes from "./src/modules/management/management.routes.js";
import adminSubscriptionRoutes from "./src/modules/subscriptions/adminSubscription.routes.js";
import adminInvitationRoutes from "./src/modules/invitation/adminInvitation.routes.js";
import adminModerationRoutes from "./src/modules/moderation/adminModeration.routes.js";
import adminDiscoveryRoutes from "./src/modules/discovery/adminDiscovery.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/admin/restaurants", adminRestaurantRoutes);
app.use("/admin/brands", adminBrandRoutes);

app.use("/admin/logs", adminLogRoutes);

app.use("/admin/users", adminUserRoutes);
app.use("/admin/management", managementRoutes);
app.use("/admin/subscriptions", adminSubscriptionRoutes);
app.use("/admin/invitations", adminInvitationRoutes);
app.use("/admin/moderation", adminModerationRoutes);
app.use("/admin/discovery", adminDiscoveryRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Admin Service Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;