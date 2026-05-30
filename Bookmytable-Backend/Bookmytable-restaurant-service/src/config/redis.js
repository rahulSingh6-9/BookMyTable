import Redis from "ioredis";

const redis = new Redis({
  host: "redis",
  port: 6379,
});

redis.on("connect", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

export default redis;