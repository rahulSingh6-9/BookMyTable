import dotenv from "dotenv";

dotenv.config();

export const internalAuth = (req, res, next) => {
  const expected = process.env.INTERNAL_API_TOKEN;

  // If not configured, don't block (dev-friendly).
  if (!expected) return next();

  const provided = req.header("x-internal-token");
  if (provided && provided === expected) return next();

  return res.status(401).json({
    success: false,
    message: "Unauthorized internal request",
  });
};

