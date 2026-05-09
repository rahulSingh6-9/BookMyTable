import express from "express";
import cookieParser from "cookie-parser";

import adminRestaurantRoutes from "./src/modules/restaurants/adminRestaurant.routes.js";
import adminLogRoutes from "./src/modules/logs/adminLog.routes.js";
import adminUserRoutes from "./src/modules/users/adminUser.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

// routes
app.use("/admin/restaurants", adminRestaurantRoutes);

app.use("/admin/logs", adminLogRoutes);

app.use("/admin/users", adminUserRoutes);


export default app;