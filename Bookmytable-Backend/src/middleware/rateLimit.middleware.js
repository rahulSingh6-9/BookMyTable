import redis from "../config/redis.js";

export const rateLimiter = (limit = 20, duration = 60) => {
  return async (req, res, next) => {
    const userId = req.headers["x-user-id"] || req.user?._id || req.ip;
    if (!userId) return next();

    const key = `rate_limit:${userId}:${req.path}`;
    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, duration);
      }
      if (current > limit) {
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: duration,
        });
      }
      next();
    } catch (err) {
      next();
    }
  };
};
