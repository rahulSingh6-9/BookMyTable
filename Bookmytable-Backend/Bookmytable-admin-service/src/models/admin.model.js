import mongoose from "mongoose";

const platformAdminSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: String,

    adminType: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "SYSTEM_ADMIN",
        "SUPPORT_ADMIN",
        "ANALYTICS_ADMIN",
      ],
      default: "SUPPORT_ADMIN",
    },

    permissions: [String],

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Admin", platformAdminSchema);