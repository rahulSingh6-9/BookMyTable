import mongoose from "mongoose";

const systemLogSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["error", "warn", "info"],
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String, // e.g., "event-bus", "database-sync", "email-service"
      index: true,
    },
    metadata: Object,
  },
  { timestamps: true }
);

export default mongoose.model("SystemLog", systemLogSchema);
