import express from "express";
import cookieParser from "cookie-parser";

import adminRestaurantRoutes from "./src/modules/restaurants/adminRestaurant.routes.js";
import adminBrandRoutes from "./src/modules/brands/adminBrand.routes.js";
import adminLogRoutes from "./src/modules/logs/adminLog.routes.js";
import adminUserRoutes from "./src/modules/users/adminUser.routes.js";
import managementRoutes from "./src/modules/management/management.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/admin/restaurants", adminRestaurantRoutes);
app.use("/admin/brands", adminBrandRoutes);

app.use("/admin/logs", adminLogRoutes);

app.use("/admin/users", adminUserRoutes);
app.use("/admin/management", managementRoutes);

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