import app from "./src/app.js";
import dotenv from "dotenv";

import dns from "node:dns";
dotenv.config();

// Fix for Node.js 18+ IPv6 DNS resolution issues in Docker (fixes ENETUNREACH/ETIMEDOUT for Cloudinary)
const originalLookup = dns.lookup;
dns.lookup = function (hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = { family: 4 };
  } else if (typeof options === "object") {
    options.family = 4;
  } else {
    options = { family: 4 };
  }
  return originalLookup(hostname, options, callback);
};

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

// 🚨 Global Error Handlers to prevent silent crashes
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // Optional: Graceful shutdown or keep running
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  // process.exit(1); // Keep it running for now to debug
});