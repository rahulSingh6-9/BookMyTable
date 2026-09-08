import RestaurantBranch from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import Table from "../../models/table.model.js";
import Booking from "../../models/booking.model.js";

const getBaseSlots = (branch, settings, dayName) => {
  const daySchedule = branch?.openingHours?.[dayName];
  if (!daySchedule || daySchedule.isClosed) {
    return [];
  }

  const startMins = daySchedule.open || 600; // default 10:00
  const endMins = daySchedule.close || 1320; // default 22:00
  const interval = settings?.timeSlotInterval || 30;
  const slotDuration = settings?.slotDuration || 60;
  
  const availableSlots = [];
  for (let m = startMins; m <= endMins - slotDuration; m += interval) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    availableSlots.push({ time: `${hh}:${mm}`, minutes: m });
  }

  return availableSlots;
};

export const generateAvailability = async (branchSlug, dateStr, partySize, tableType = null) => {
  // 1. Fetch Branch & Settings Natively
  const branch = await RestaurantBranch.findOne({ slug: branchSlug, isActive: true, isDeleted: false }).lean();
  
  if (!branch) {
    return { tables: [], slots: [] };
  }

  const settings = await RestaurantSettings.findOne({ branch: branch._id }).lean();

  // 2. Filter Native Tables
  let tables = await Table.find({ branch: branch._id, isActive: true, status: { $nin: ["inactive", "maintenance"] } }).lean();
  
  tables = tables.filter(t => t.capacity >= partySize);
  if (tableType) {
    tables = tables.filter(t => t.type.toLowerCase() === tableType.toLowerCase());
  }

  if (tables.length === 0) {
    return { tables: [], slots: [] };
  }

  // 3. Base Slots
  const dayIndex = new Date(dateStr).getDay();
  const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const baseSlots = getBaseSlots(branch, settings, DAYS_OF_WEEK[dayIndex]);

  if (baseSlots.length === 0) {
    return { tables: [], slots: [] };
  }

  // 4. Existing Reservations
  const tableIds = tables.map(t => String(t._id));
  const existingBookings = await Booking.find({ 
    restaurantId: branch._id, 
    date: dateStr, 
    status: "confirmed",
    tableId: { $in: tableIds }
  }).lean();

  const slotDuration = settings?.slotDuration || 60;
  const buffer = settings?.tableBufferMinutes || 15;
  const totalOccupancyMinutes = slotDuration + buffer;

  const finalTables = [];
  const allAvailableSlotsSet = new Set();

  for (const table of tables) {
    const tableBookings = existingBookings.filter(b => String(b.tableId) === String(table._id));
    
    const bookingsMinutes = tableBookings.map(b => {
      const [h, m] = b.time.split(':').map(Number);
      return h * 60 + m;
    });

    const tableAvailableSlots = [];

    for (const slot of baseSlots) {
      let isOverlapping = false;
      
      for (const bMins of bookingsMinutes) {
        const bStart = bMins;
        const bEnd = bStart + totalOccupancyMinutes;
        const slotStart = slot.minutes;
        const slotEnd = slotStart + totalOccupancyMinutes;

        if (bStart < slotEnd && bEnd > slotStart) {
          isOverlapping = true;
          break;
        }
      }

      if (!isOverlapping) {
        tableAvailableSlots.push(slot.time);
        allAvailableSlotsSet.add(slot.time);
      }
    }

    const isReserved = tableAvailableSlots.length === 0;

    finalTables.push({
      id: table._id,
      name: table.tableCode,
      capacity: table.capacity,
      type: table.type,
      status: isReserved ? "reserved" : table.status,
      price: table.resolvedPrice || 0,
      priceSource: table.priceSource || "none",
      floorLabel: table.floorLabel || "Main Floor",
      sectionLabel: table.sectionLabel || "General",
      availableSlots: tableAvailableSlots
    });
  }

  return {
    tables: finalTables,
    slots: Array.from(allAvailableSlotsSet).sort()
  };
};
