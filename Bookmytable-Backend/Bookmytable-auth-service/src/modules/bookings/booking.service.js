import Booking from "../../models/bookings.model.js";
import Table from "../../models/table.model.js";
import TableLock from "../../models/tableLock.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";

// 🔥 SOCKET EVENTS
import { emitBookingCreated } from "../../sockets/booking.socket.js";
import { emitTableUnlocked } from "../../sockets/lock.socket.js";

// ===============================
// 🔥 HELPER: TIME OVERLAP CHECK
// ===============================
const isOverlapping = (start1, end1, start2, end2) => {
  return start1 < end2 && end1 > start2;
};

// ===============================
// 🚀 CREATE BOOKING (FINAL)
// ===============================
export const createBooking = async ({
  userId,
  restaurantId,
  tableId,
  date,
  startTime,
  endTime,
  guests,
  bookingSource = "app",
}) => {
  // 1️⃣ CHECK TABLE EXISTS
  const table = await Table.findById(tableId);

  if (!table || !table.isActive) {
    throw new Error("Table not available");
  }

  // 2️⃣ VERIFY RESTAURANT OWNERSHIP
  if (table.restaurant.toString() !== restaurantId) {
    throw new Error("Invalid table for this restaurant");
  }

  // 3️⃣ CAPACITY CHECK
  if (guests > table.capacity) {
    throw new Error("Guest count exceeds table capacity");
  }

  // ===============================
  // 4️⃣ CHECK EXISTING BOOKINGS
  // ===============================
  const existingBookings = await Booking.find({
    table: tableId,
    date,
    status: { $in: ["pending", "confirmed"] },
  });

  for (const booking of existingBookings) {
    if (
      isOverlapping(
        startTime,
        endTime,
        booking.startTime,
        booking.endTime
      )
    ) {
      throw new Error("Table already booked for this time slot");
    }
  }

  // ===============================
  // 5️⃣ CHECK TABLE LOCKS
  // ===============================
  const activeLocks = await TableLock.find({
    table: tableId,
    date,
    expiresAt: { $gt: new Date() }, // 🔥 only active locks
  });

  for (const lock of activeLocks) {
    if (
      isOverlapping(startTime, endTime, lock.startTime, lock.endTime)
    ) {
      throw new Error("Table is temporarily locked by another user");
    }
  }

  // ===============================
  // 6️⃣ RESTAURANT SETTINGS RULES
  // ===============================
  const settings = await RestaurantSettings.findOne({
    restaurant: restaurantId,
  });

  if (settings) {
    // SLOT LIMIT
    const totalBookings = await Booking.countDocuments({
      restaurant: restaurantId,
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    if (totalBookings >= settings.maxTablesPerSlot) {
      throw new Error("Slot fully booked");
    }

    // ONLINE LIMIT
    if (bookingSource === "app") {
      const onlineBookings = await Booking.countDocuments({
        restaurant: restaurantId,
        date,
        bookingSource: "app",
        status: { $in: ["pending", "confirmed"] },
      });

      if (onlineBookings >= settings.onlineBookingLimit) {
        throw new Error("Online booking limit reached");
      }
    }

    // TIME SLOT VALIDATION (IMPORTANT)
    if (settings.timeSlotInterval) {
      const diff =
        new Date(`1970-01-01T${endTime}`) -
        new Date(`1970-01-01T${startTime}`);

      if (diff > settings.timeSlotInterval) {
        throw new Error("Time slot exceeds allowed limit");
      }
    }
  }

  // ===============================
  // 7️⃣ CREATE BOOKING
  // ===============================
  const booking = await Booking.create({
    user: userId,
    restaurant: restaurantId,
    table: tableId,
    date,
    startTime,
    endTime,
    guests,
    bookingSource,
    status: "confirmed",
    checkedIn: false,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min window
  });

  // ===============================
  // 8️⃣ UPDATE TABLE STATUS
  // ===============================
  table.status = "reserved";
  await table.save();

  // ===============================
  // 9️⃣ REMOVE TABLE LOCKS
  // ===============================
  const deletedLocks = await TableLock.find({
    table: tableId,
    user: userId,
  });

  await TableLock.deleteMany({
    table: tableId,
    user: userId,
  });

  // ===============================
  // 🔥 10️⃣ SOCKET EVENTS (REAL-TIME)
  // ===============================

  // 10.1 Booking created event
  emitBookingCreated(booking);

  // 10.2 Unlock table globally (important for UI sync)
  emitTableUnlocked({
    restaurantId,
    tableId,
  });

  // ===============================
  // 🔟 RETURN
  // ===============================
  return booking;
};