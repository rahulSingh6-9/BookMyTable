import Redis from "ioredis";
import { env } from "./env.js";

const redisUrl = env.REDIS_URL;

let redis;
let isRedisConnected = false;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 4000,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("⚠️ [Redis] Max reconnection attempts reached. Halting auto-retry.");
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    redis.on("connect", () => {
      isRedisConnected = true;
      console.log("✅ [Redis] Connected successfully");
    });

    redis.on("ready", () => {
      isRedisConnected = true;
    });

    redis.on("error", (err) => {
      isRedisConnected = false;
      console.error("❌ [Redis Error]:", err.message);
    });

    redis.on("close", () => {
      isRedisConnected = false;
    });
  } catch (err) {
    console.error("❌ [Redis] Failed to initialize client:", err.message);
  }
} else {
  console.log("ℹ️ [Redis] REDIS_URL not configured. Cache acceleration disabled; MongoDB serves as authoritative source.");
}

export const isRedisReady = () => isRedisConnected && redis?.status === "ready";

// Export client with safe fallback if not configured
export default redis || {
  get: async () => null,
  set: async () => "OK",
  del: async () => 1,
  incr: async () => 1,
  expire: async () => 1,
  on: () => {},
  status: "unconfigured",
};
