import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join_restaurant", (restaurantId) => {
      if (restaurantId) {
        socket.join(`restaurant_${restaurantId}`);
        console.log(`🔌 Socket ${socket.id} joined room restaurant_${restaurantId}`);
      }
    });

    socket.on("leave_restaurant", (restaurantId) => {
      if (restaurantId) {
        socket.leave(`restaurant_${restaurantId}`);
        console.log(`🔌 Socket ${socket.id} left room restaurant_${restaurantId}`);
      }
    });

    socket.on("join_user", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`🔌 Socket ${socket.id} joined room user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) return null;
  return io;
};

/**
 * Emit table availability change to connected clients viewing the restaurant
 * Safe: only broadcasts table IDs, date, time, and new status (available / held / booked)
 */
export const emitTableAvailabilityChanged = ({ restaurantId, date, time, tableIds, status }) => {
  if (!io || !restaurantId) return;
  const payload = {
    restaurantId: String(restaurantId),
    date,
    time,
    tableIds: Array.isArray(tableIds) ? tableIds.map(String) : [String(tableIds)],
    status, // "held" | "available" | "booked"
    timestamp: new Date().toISOString(),
  };
  io.to(`restaurant_${restaurantId}`).emit("table:availability_changed", payload);
  console.log(`📡 [Socket] table:availability_changed emitted to restaurant_${restaurantId}:`, payload);
};

/**
 * Emit booking confirmation to restaurant and customer rooms
 */
export const emitBookingConfirmed = ({ restaurantId, userId, booking }) => {
  if (!io) return;
  const safeBooking = {
    _id: booking._id,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    status: booking.status,
    tablePrice: booking.tablePrice,
    grandTotal: booking.grandTotal,
    tables: booking.tables,
    createdAt: booking.createdAt,
  };

  if (restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit("booking:confirmed", safeBooking);
  }
  if (userId) {
    io.to(`user_${userId}`).emit("booking:confirmed", safeBooking);
  }
};

/**
 * Emit booking cancellation to restaurant and customer rooms
 */
export const emitBookingCancelled = ({ restaurantId, userId, bookingId, tableIds, date, time }) => {
  if (!io) return;
  const payload = { bookingId, tableIds, date, time, status: "cancelled" };

  if (restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit("booking:cancelled", payload);
  }
  if (userId) {
    io.to(`user_${userId}`).emit("booking:cancelled", payload);
  }
};

/**
 * Emit booking created / payment pending
 */
export const emitBookingCreated = ({ restaurantId, userId, booking }) => {
  if (!io) return;
  const safeBooking = {
    _id: booking._id,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    status: booking.status,
    createdAt: booking.createdAt,
  };

  if (restaurantId) {
    io.to(`restaurant_${restaurantId}`).emit("booking:created", safeBooking);
  }
  if (userId) {
    io.to(`user_${userId}`).emit("booking:created", safeBooking);
  }
};
