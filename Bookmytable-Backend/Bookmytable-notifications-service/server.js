import dotenv from 'dotenv' 
dotenv.config()

import app from './src/app.js'
import { connectDB } from './src/config/db.js'
import { initKafka } from "./src/kafka/index.js";

const startServer = async () => {
  try {
    await connectDB();
    await initKafka();

    const PORT = process.env.PORT || 5006;
    app.listen(PORT, () => {
      console.log(`🚀 Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start notification service:", error);
  }
};

startServer();