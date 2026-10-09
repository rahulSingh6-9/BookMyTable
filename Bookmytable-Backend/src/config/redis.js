import Redis from "ioredis";
import { env } from "./env.js";

const redisUrl = env.REDIS_URL;

let redis;
if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });

  redis.on("connect", () => {
    console.log("✅ Redis Connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis Error:", err.message);
  });
} else {
  console.warn("⚠️ REDIS_URL environment variable is not set.");
  redis = {
    get: async () => null,
    set: async () => "OK",
    del: async () => 1,
    incr: async () => 1,
    expire: async () => 1,
    on: () => {},
  };
}

export default redis;
