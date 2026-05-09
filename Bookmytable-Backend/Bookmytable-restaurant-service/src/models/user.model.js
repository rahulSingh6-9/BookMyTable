import mongoose from "mongoose";

/**
 * 🔥 Minimal User Schema for Cross-Service Population
 * This allows the Restaurant service to populate owner/user details
 * assuming they share the same database.
 */
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    roles: [String],
  },
  { timestamps: true }
);

// Check if model exists before defining to prevent OverwriteModelError in watch mode
export default mongoose.models.User || mongoose.model("User", userSchema);
