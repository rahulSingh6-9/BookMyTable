import dns from "dns";
import http from "http";
import https from "https";

// In local dev environments, prioritize IPv4 for local MongoDB/Redis resolution
if (!process.env.VERCEL) {
  dns.setDefaultResultOrder("ipv4first");
  http.globalAgent.options.family = 4;
  http.globalAgent.options.autoSelectFamily = false;
  https.globalAgent.options.family = 4;
  https.globalAgent.options.autoSelectFamily = false;
}

import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { initSocket } from "./src/config/socket.js";
import redis from "./src/config/redis.js";

const PORT = env.PORT || 5000;

// Create HTTP server & Socket.IO
const server = http.createServer(app);
initSocket(server);

async function startServer() {
  try {
    // 1. Connect to Database (cached for subsequent invocations)
    await connectDB();

    // 2. Start HTTP server (for local dev, Docker, and standalone hosting)
    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 BookMyTable Modular Monolith is Running!`);
      console.log(`📡 Port:        ${PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API Base:    http://localhost:${PORT}/api`);
      console.log(`🩺 Health:      http://localhost:${PORT}/health`);
      console.log(`⚡ Event Bus:   In-Process Modular Architecture (Zero Kafka)`);
      console.log(`===============================================`);
    });

    // 3. Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log("🔌 HTTP Server closed.");
        await disconnectDB();
        try {
          if (redis && typeof redis.quit === "function") {
            await redis.quit();
            console.log("🔌 Redis connection closed.");
          }
        } catch (e) {}
        console.log("👋 Process terminated cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Error during server startup:", error.message || error);
    // In local dev/Docker, exit process. In serverless (Vercel), allow express to handle requests and return diagnostic 503
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

// Start server
startServer();

// Export app for Vercel Serverless Function runtime
export default app;
