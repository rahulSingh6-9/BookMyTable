import { getIO } from "../config/socket.js";

export const emitTableLocked = (data) => {
  const io = getIO();

  io.to(`restaurant_${data.restaurantId}`).emit("table_locked", {
    tableId: data.tableId,
    userId: data.userId,
    expiresAt: data.expiresAt,
  });
};

export const emitTableUnlocked = (data) => {
  const io = getIO();

  io.to(`restaurant_${data.restaurantId}`).emit("table_unlocked", {
    tableId: data.tableId,
  });
};