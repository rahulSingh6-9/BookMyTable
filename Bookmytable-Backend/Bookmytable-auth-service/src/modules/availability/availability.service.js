import Table from "../../models/table.model.js";
import Booking from "../../models/bookings.model.js";
import TableLock from "../../models/tableLock.model.js";

const isTimeOverlap = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

export const getAvailableTablesService = async ({
  restaurantId,
  date,
  startTime,
  endTime,
}) => {
  // STEP 1: Get all tables of restaurant
  const tables = await Table.find({ restaurant: restaurantId });

  const availableTables = [];

  for (const table of tables) {
    let isAvailable = true;

    // -------------------------------
    // STEP 2: CHECK ACTIVE LOCKS
    // -------------------------------
    const activeLock = await TableLock.findOne({
      table: table._id,
      date,
      expiresAt: { $gt: new Date() },
    });

    if (activeLock) {
      isAvailable = false;
    }

    // -------------------------------
    // STEP 3: CHECK BOOKINGS
    // -------------------------------
    if (isAvailable) {
      const bookings = await Booking.find({
        table: table._id,
        date,
        status: { $in: ["pending", "confirmed"] },
      });

      for (const booking of bookings) {
        if (
          isTimeOverlap(
            startTime,
            endTime,
            booking.startTime,
            booking.endTime
          )
        ) {
          isAvailable = false;
          break;
        }
      }
    }

    // -------------------------------
    // STEP 4: PUSH IF AVAILABLE
    // -------------------------------
    if (isAvailable) {
      availableTables.push(table);
    }
  }

  return availableTables;
};