import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRouter from "./routes/api.router.js";
import { errorHandler } from "./middleware/error.middleware.js";

import { env } from "./config/env.js";
import { connectDB, getDatabaseStatus, classifyMongoError } from "./config/db.js";

const app = express();

// Trust proxy for secure headers behind Vercel / reverse proxy
app.set("trust proxy", 1);

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  env.WEB_URL,
  env.ADMIN_URL,
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-branch-id", "x-internal-token", "x-user-id", "x-user-roles", "x-permissions", "x-scope"],
  })
);

app.use(
  express.json({
    limit: "50mb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Health check handler - checks authentic database connectivity
const handleHealthCheck = (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.isConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "degraded",
    database: dbStatus.state,
    architecture: "modular-monolith",
    timestamp: new Date().toISOString(),
    ...(dbStatus.lastError ? { diagnostic: dbStatus.lastError } : {}),
  });
};

app.get("/health", handleHealthCheck);
app.get("/api/health", handleHealthCheck);

// Database assurance middleware for all database-dependent API routes
const ensureDbConnected = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    const classification = classifyMongoError(err);
    console.error(`❌ [API DB Guard] Request ${req.method} ${req.originalUrl} failed: ${classification}`);
    return res.status(503).json({
      success: false,
      message: "Database service is temporarily unavailable. Please verify network access and configuration.",
      code: "DATABASE_UNAVAILABLE",
      ...(process.env.NODE_ENV !== "production" ? { diagnostic: classification } : {}),
    });
  }
};

// Mount All API Routes with database connectivity assurance
app.use("/api", ensureDbConnected, apiRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
