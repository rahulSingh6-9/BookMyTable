import dotenv from "dotenv";
dotenv.config()
import path from "path";
import { fileURLToPath } from "url";

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb://host.docker.internal:27017/", {
      dbName: "bookmytable",
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};