import { getIO } from "../../config/socket.js";
import { createBooking } from "./booking.service.js";

export const createBookingController = async (req, res, next) => {
  try {
    const booking = await createBooking({
      userId: req.user._id,
      ...req.body,
    });

    const io = getIO()

    io.emit("newBooking", booking)

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};