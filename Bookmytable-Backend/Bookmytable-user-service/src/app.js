import express from "express";
import cors from "cors";
import userRoutes from "./modules/user/user.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/internal", adminRoutes)


export default app;