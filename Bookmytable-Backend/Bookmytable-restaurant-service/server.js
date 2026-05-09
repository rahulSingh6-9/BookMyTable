import app from "./src/app.js";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./src/config/db.js";
import { initKafka } from "./src/kafka/index.js";

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();
    
    // Initialize Kafka
    await initKafka();

    app.listen(PORT, () => {
      console.log(`Restaurant Service running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();