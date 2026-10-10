import mongoose from "mongoose";
import { env } from "./env.js";

let cachedPromise = null;
let lastConnectionError = null;

/**
 * Classifies MongoDB connection errors for actionable diagnostics without leaking credentials.
 */
export const classifyMongoError = (error) => {
  if (!error) return "UNKNOWN_ERROR";
  const msg = error.message || String(error);

  if (!env.MONGO_URI) {
    return "MISSING_CONFIG: Neither MONGO_URI nor MONGODB_URI is defined in environment variables";
  }
  if (msg.includes("bad auth") || msg.includes("Authentication failed") || msg.includes("auth failed")) {
    return "AUTH_FAILED: Database credentials rejected by MongoDB Atlas";
  }
  if (msg.includes("querySrv") || msg.includes("ENOTFOUND")) {
    return "DNS_RESOLUTION_FAILED: Could not resolve MongoDB host via DNS (check SRV record or network DNS)";
  }
  if (msg.includes("ETIMEDOUT") || msg.includes("Server selection timed out") || msg.includes("no primary found") || msg.includes("buffering timed out")) {
    return "NETWORK_TIMEOUT_OR_WHITELIST: Connection timed out. Likely MongoDB Atlas Network Access IP whitelist issue (Vercel serverless IP not permitted) or firewall restriction";
  }
  if (msg.includes("certificate") || msg.includes("TLS") || msg.includes("SSL")) {
    return "TLS_SSL_HANDSHAKE_ERROR: Secure connection negotiation failed";
  }
  return `CONNECTION_ERROR: ${msg}`;
};

/**
 * Sanitizes MongoDB connection URI for safe logging (redacts username & password).
 */
export const getSanitizedMongoUri = () => {
  const uri = env.MONGO_URI;
  if (!uri) return "[NOT_CONFIGURED]";
  try {
    return uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  } catch {
    return "[MALFORMED_URI]";
  }
};

/**
 * Serverless-compatible MongoDB connection manager.
 * Safely caches connection promises across cold starts, warm starts, and concurrent requests.
 */
export const connectDB = async () => {
  // 1. ReadyState 1: Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. ReadyState 2: Currently connecting - await in-flight promise to avoid connection churn
  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  // 3. Validate URI
  if (!env.MONGO_URI) {
    const err = new Error("Neither MONGO_URI nor MONGODB_URI is configured in environment variables.");
    lastConnectionError = err;
    console.error("❌ [MongoDB] Configuration error:", err.message);
    throw err;
  }

  const isSrv = env.MONGO_URI.startsWith("mongodb+srv://");

  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 0,
    // For standard non-SRV connections on local systems, use family: 4; for SRV, allow default DNS
    ...(isSrv ? {} : { family: 4 }),
  };

  try {
    cachedPromise = mongoose.connect(env.MONGO_URI, options).then((m) => {
      lastConnectionError = null;
      console.log(`✅ [MongoDB] Connected: host=${m.connection.host}, readyState=${m.connection.readyState}`);
      return m.connection;
    });

    await cachedPromise;
    return mongoose.connection;
  } catch (error) {
    cachedPromise = null; // Clear so subsequent requests can retry
    lastConnectionError = error;
    const classification = classifyMongoError(error);
    console.error(`❌ [MongoDB] Connection failed: ${classification}`);
    throw error;
  }
};

/**
 * Helper to inspect database connection status without throwing.
 */
export const getDatabaseStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || "unknown",
    readyState: stateCode,
    isConnected: stateCode === 1,
    sanitizedUri: getSanitizedMongoUri(),
    lastError: lastConnectionError ? classifyMongoError(lastConnectionError) : null,
  };
};

export const disconnectDB = async () => {
  try {
    cachedPromise = null;
    await mongoose.disconnect();
    console.log("🔌 [MongoDB] Disconnected cleanly.");
  } catch (error) {
    console.error("❌ [MongoDB] Error disconnecting:", error.message);
  }
};

export default connectDB;
