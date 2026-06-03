import SystemLog from "../models/systemLog.model.js";

/**
 * Global Logger utility to replace standard console logs in critical paths.
 * Saves technical logs (errors, sync failures) to the database for the System Logs page.
 */
class Logger {
  static async logError(service, source, message, metadata = {}) {
    console.error(`[${service}][${source}] ❌ ${message}`, metadata);
    try {
      await SystemLog.create({
        service,
        level: "error",
        source,
        message,
        metadata
      });
    } catch (err) {
      console.error("Failed to write to SystemLog:", err);
    }
  }

  static async logWarn(service, source, message, metadata = {}) {
    console.warn(`[${service}][${source}] ⚠️ ${message}`, metadata);
    try {
      await SystemLog.create({
        service,
        level: "warn",
        source,
        message,
        metadata
      });
    } catch (err) {
      console.error("Failed to write to SystemLog:", err);
    }
  }

  static async logInfo(service, source, message, metadata = {}) {
    console.info(`[${service}][${source}] ℹ️ ${message}`);
    try {
      await SystemLog.create({
        service,
        level: "info",
        source,
        message,
        metadata
      });
    } catch (err) {
      console.error("Failed to write to SystemLog:", err);
    }
  }
}

export default Logger;
