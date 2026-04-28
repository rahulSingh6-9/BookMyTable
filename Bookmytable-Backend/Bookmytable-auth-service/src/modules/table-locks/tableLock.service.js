import TableLock from "../../models/tableLock.model.js";
import { emitTableLocked, emitTableUnlocked } from "../../sockets/lock.socket.js";


const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * CREATE LOCK
 */
export const createLockService = async (data, userId) => {
  const expiresAt = new Date(Date.now() + LOCK_DURATION);

  const lock = await TableLock.create({
    ...data,
    user: userId,
    expiresAt,
  });

  // 🔥 SOCKET EVENT
  emitTableLocked({
    restaurantId: data.restaurant,
    tableId: data.table,
    userId,
    expiresAt,
  });

  return lock;
}

export const releaseLockService = async (tableId, userId) => {
  const lock = await TableLock.findOneAndDelete({
    table: tableId,
    user: userId,
  });

  if (lock) {
    emitTableUnlocked({
      restaurantId: lock.restaurant,
      tableId,
    });
  }

  return lock;
};

export const getLocksByRestaurantService = async (restaurantId) => {
  return await TableLock.find({
    restaurant: restaurantId,
    expiresAt: { $gt: new Date() }, // ONLY ACTIVE
  }).populate("table user");
}