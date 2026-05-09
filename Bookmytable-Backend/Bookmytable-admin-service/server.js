import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { initKafka } from "./src/kafka/index.js";
import { initialUserSync, initialRestaurantSync } from "./src/services/initialSync.service.js";


const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB()

    // 1️⃣ Initial Sync (safe)
    await initialUserSync();
    await initialRestaurantSync();

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

startServer();
