import dns from "dns";
import http from "http";
import https from "https";

dns.setDefaultResultOrder("ipv4first");
http.globalAgent.options.family = 4;
http.globalAgent.options.autoSelectFamily = false;
https.globalAgent.options.family = 4;
https.globalAgent.options.autoSelectFamily = false;
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB, disconnectDB } from "./src/config/db.js";
import { initSocket } from "./src/config/socket.js";
import redis from "./src/config/redis.js";

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP server & Socket.IO
    const server = http.createServer(app);
    initSocket(server);

    // 3. Start HTTP server
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

    // 4. Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log("🔌 HTTP Server closed.");
        await disconnectDB();
        try {
          await redis.quit();
          console.log("🔌 Redis connection closed.");
        } catch (e) {}
        console.log("👋 Process terminated cleanly.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("❌ Fatal error during server startup:", error);
    process.exit(1);
  }
}

startServer();
