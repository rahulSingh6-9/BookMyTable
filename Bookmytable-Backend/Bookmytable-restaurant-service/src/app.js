import express from "express";
import cors from "cors";
import "./models/user.model.js"; // 🔥 Register User model for populate
import restaurantRoutes from "./routes/restaurant.routes.js";
import adminRoutes from "./routes/admin.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/restaurants", restaurantRoutes);
app.use("/admin", adminRoutes)


export default app;