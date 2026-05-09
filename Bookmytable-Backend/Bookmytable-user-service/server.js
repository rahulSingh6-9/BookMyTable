import app from "./src/app.js";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import { initKafka } from "./src/kafka/index.js";

dotenv.config();

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await connectDB();
    await initKafka();


    app.listen(PORT, () => {
      console.log(`User Service running on ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start user-service:", error);
  }
};

startServer();