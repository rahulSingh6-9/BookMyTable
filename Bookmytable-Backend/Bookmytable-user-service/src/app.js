import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/admin", adminRoutes)


export default app;