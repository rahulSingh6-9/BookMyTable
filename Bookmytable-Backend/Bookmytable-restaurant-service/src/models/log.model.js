import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    role: {
      type: String,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    metadata: {
      type: Object,
      default: {},
    },

    ipAddress: String,

    service: {
      type: String,
      default: "restaurant-service",
    },
  },
  { timestamps: true }
);

const Log = mongoose.model("servicelogs", logSchema);

export default Log