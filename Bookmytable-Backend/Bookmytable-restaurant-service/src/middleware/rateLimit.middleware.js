import redis from "../config/redis.js";

/**
 * Basic Redis-based rate limiting middleware.
 * Limits requests per user (x-user-id).
 * Default: 20 requests per minute.
 */
export const rateLimiter = (limit = 20, duration = 60) => {
  return async (req, res, next) => {
    const userId = req.headers["x-user-id"];
    
    // If no user ID, we might skip or use IP. For staff operations, userId is expected.
    if (!userId) {
      return next();
    }

    const key = `rate_limit:${userId}:${req.path}`;
    
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, duration);
      }

      if (current > limit) {
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
          retryAfter: duration,
        });
      }

      next();
    } catch (err) {
      console.error("[RateLimiter] Error:", err.message);
      // Fallback: allow request on Redis error
      next();
    }
  };
};
