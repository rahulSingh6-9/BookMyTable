import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "wallet"],
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    transactionId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);