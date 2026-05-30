import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { initKafka } from "./kafka/index.js";
import bookingRoutes from "./routes/booking.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to DB and Kafka
connectDB();
initKafka();

// Routes
app.use("/booking", bookingRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Booking service is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Booking service running on port ${PORT}`);
});
