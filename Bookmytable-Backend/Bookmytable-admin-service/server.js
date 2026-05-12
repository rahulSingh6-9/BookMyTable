import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { initKafka } from "./src/kafka/index.js";
import { 
  initialUserSync, 
  initialRestaurantSync,
  initialBrandSync,
  initialBranchSync,
  initialMembershipSync
} from "./src/services/initialSync.service.js";
import "./src/models/index.js"; // 🔥 Register all models


const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB()

    // 1️⃣ Initial Sync (safe)
    await initialUserSync();
    await initialRestaurantSync();
    await initialBrandSync();
    await initialBranchSync();
    await initialMembershipSync();

    // 2. Initialize Kafka
    await initKafka();
    
    const port = process.env.PORT
    
    // 3. Start Express App
    app.listen(port, () => {
      console.log(`🔥 Admin Service running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Admin Service startup error:", error);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ [Admin Service] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ [Admin Service] Uncaught Exception:", error);
  process.exit(1);
});

startServer();
