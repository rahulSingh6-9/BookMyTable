import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async (retries = 3) => {
  while (retries > 0) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        family: 4
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries--;
      console.error(`❌ MongoDB connection failed: ${error.message}. Retries left: ${retries}`);
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  } catch (error) {
    console.error("❌ Error disconnecting MongoDB:", error.message);
  }
};

export default connectDB;
