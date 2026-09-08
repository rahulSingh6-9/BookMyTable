import { createReservation } from "./booking.service.js";
import Booking from "../../models/booking.model.js";

export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const booking = await createReservation(userId, req.body);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    if (error.code === "PLAN_LIMIT_EXCEEDED") {
      return res.status(403).json({ success: false, message: error.message, code: "PLAN_LIMIT_EXCEEDED" });
    }
    res.status(400).json({ success: false, message: error.message || "Internal server error" });
  }
};
