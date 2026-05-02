import express from "express";
import cors from "cors";
import "./models/user.model.js"; // 🔥 Register User model for populate
import restaurantRoutes from "./routes/restaurant.routes.js";
import adminRoutes from "./routes/admin.routes.js"
import tableRoutes from "./routes/table.routes.js"
import menuCategoryRoutes from "./routes/menuCategory.routes.js"
import menuItemRoutes from "./routes/menuItem.routes.js"
import settingsRoutes from "./routes/settings.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/restaurants", restaurantRoutes);
app.use("/admin", adminRoutes)
app.use("/tables", tableRoutes)
app.use("/menu-categories", menuCategoryRoutes)
app.use("/menu-items", menuItemRoutes);
app.use("/availability", settingsRoutes)

export default app;