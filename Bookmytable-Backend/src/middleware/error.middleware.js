export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Path not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error("❌ [API Error]:", err.message || err);
  if (err.stack && process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
