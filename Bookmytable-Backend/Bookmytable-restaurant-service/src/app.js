import express from "express";
import cors from "cors";
import restaurantRoutes from "./modules/restaurant/restaurant.routes.js";
import tableRoutes from "./modules/table/table.routes.js"
import menuCategoryRoutes from "./modules/menu-category/menuCategory.routes.js"
import menuItemRoutes from "./modules/menu-item/menuItem.routes.js"
import settingsRoutes from "./modules/settings/settings.routes.js"
import staffRoutes from "./modules/staff/staff.routes.js"
import logRoutes from "./modules/log/log.routes.js"

import adminRoutes from "./modules/admin/admin.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/logs", logRoutes);

app.use("/internal", adminRoutes);

app.use("/restaurants", restaurantRoutes)
app.use("/tables", tableRoutes)
app.use("/menu-categories", menuCategoryRoutes)
app.use("/menu-items", menuItemRoutes)
app.use("/availability", settingsRoutes)
app.use("/staff", staffRoutes)


export default app;