import { getIO } from "../config/socket.js";

export const emitBookingCreated = (booking) => {
  const io = getIO();

  io.to(`restaurant_${booking.restaurant}`).emit("booking_created", {
    bookingId: booking._id,
    tableId: booking.table,
    status: booking.status,
  });
};