import Booking from "../models/booking.model.js";
import { emitBookingCreated } from "../kafka/index.js";
import axios from "axios";

// Helper to get restaurant details (settings + tables)
const getRestaurantData = async (restaurantId, req) => {
  try {
    const res = await axios.get(`http://api-gateway:5000/api/discovery/${restaurantId}`);
    return {
      settings: res.data?.data?.settings || null,
      tables: res.data?.data?.tables || []
    };
  } catch (err) {
    console.error("Error fetching restaurant data", err.message);
    return { settings: null, tables: [] };
  }
};

const getBaseSlots = (settings, dayName) => {
  const daySchedule = settings?.openingHours?.[dayName];
  if (!daySchedule || daySchedule.isClosed) {
    return [];
  }

  const startMins = daySchedule.open || 600; // default 10:00
  const endMins = daySchedule.close || 1320; // default 22:00
  const interval = settings?.timeSlotInterval || 30;
  const slotDuration = settings?.slotDuration || settings?.bookingSettings?.slotDurationMinutes || 60;
  
  const availableSlots = [];
  for (let m = startMins; m <= endMins - slotDuration; m += interval) {
    const hh = Math.floor(m / 60).toString().padStart(2, '0');
    const mm = (m % 60).toString().padStart(2, '0');
    availableSlots.push({ time: `${hh}:${mm}`, minutes: m });
  }

  return availableSlots;
};

export const getAvailability = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { date, partySize, tableType } = req.query;

    if (!date || !partySize) {
      return res.status(400).json({ success: false, message: "Date and partySize are required" });
    }

    const { settings, tables } = await getRestaurantData(restaurantId, req);
    
    if (!settings || tables.length === 0) {
      return res.status(200).json({ success: true, data: { tables: [], slots: [] } });
    }

    // 1. Filter tables by capacity and optionally type
    let eligibleTables = tables.filter(t => t.isActive && t.status !== "inactive" && t.capacity >= Number(partySize));
    if (tableType) {
      eligibleTables = eligibleTables.filter(t => t.type.toLowerCase() === tableType.toLowerCase());
    }

    if (eligibleTables.length === 0) {
      return res.status(200).json({ success: true, data: { tables: [], slots: [] } });
    }

    // 2. Generate base slots for the day
    const dayIndex = new Date(date).getDay();
    const DAYS_OF_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const baseSlots = getBaseSlots(settings, DAYS_OF_WEEK[dayIndex]);
    
    if (baseSlots.length === 0) {
      return res.status(200).json({ success: true, data: { tables: [], slots: [] } });
    }

    // 3. Fetch existing bookings for this date
    // We only care about bookings for the eligible tables
    const tableIds = eligibleTables.map(t => String(t._id));
    const existingBookings = await Booking.find({ 
      restaurantId, 
      date, 
      status: "confirmed",
      tableId: { $in: tableIds }
    });

    const slotDuration = settings?.slotDuration || settings?.bookingSettings?.slotDurationMinutes || 60;
    const buffer = settings?.tableBufferMinutes || 15;
    const totalOccupancyMinutes = slotDuration + buffer;

    // 4. Calculate available slots per table
    const finalTables = [];
    const allAvailableSlotsSet = new Set();

    for (const table of eligibleTables) {
      // Find bookings for THIS specific table
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

      if (tableAvailableSlots.length > 0) {
        finalTables.push({
          id: table._id,
          name: table.name,
          capacity: table.capacity,
          type: table.type,
          status: table.status,
          availableSlots: tableAvailableSlots
        });
      }
    }

    const allSlotsArray = Array.from(allAvailableSlotsSet).sort();

    res.status(200).json({
      success: true,
      data: {
        tables: finalTables,
        slots: allSlotsArray
      }
    });
  } catch (error) {
    console.error("❌ Error fetching availability:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { restaurantId, tableId, slot, date, partySize, specialRequests } = req.body;
    const time = slot || req.body.time; // support both
    const guests = partySize || req.body.guests; // support both
    
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!tableId || !time || !date || !guests) {
      return res.status(400).json({ success: false, message: "Missing required booking details (tableId, time, date, partySize)" });
    }

    const { settings, tables } = await getRestaurantData(restaurantId, req);
    if (!settings) {
      return res.status(400).json({ success: false, message: "Restaurant configuration not found" });
    }

    const table = tables.find(t => String(t._id) === String(tableId));
    if (!table) {
      return res.status(404).json({ success: false, message: "Selected table not found in restaurant" });
    }

    if (table.capacity < Number(guests)) {
      return res.status(400).json({ success: false, message: "Table capacity is too small for this party size" });
    }

    // Exact Overlap Check for THIS tableId
    const slotDuration = settings?.slotDuration || settings?.bookingSettings?.slotDurationMinutes || 60;
    const buffer = settings?.tableBufferMinutes || 15;
    const totalOccupancyMinutes = slotDuration + buffer;

    const existingBookings = await Booking.find({ 
      restaurantId, 
      date, 
      status: "confirmed",
      tableId 
    });

    const [reqH, reqM] = time.split(':').map(Number);
    const reqSlotStart = reqH * 60 + reqM;
    const reqSlotEnd = reqSlotStart + totalOccupancyMinutes;

    let isOverlapping = false;
    for (const b of existingBookings) {
      const [h, m] = b.time.split(':').map(Number);
      const bStart = h * 60 + m;
      const bEnd = bStart + totalOccupancyMinutes;

      if (bStart < reqSlotEnd && bEnd > reqSlotStart) {
        isOverlapping = true;
        break;
      }
    }

    if (isOverlapping) {
      return res.status(400).json({ success: false, message: "Selected slot is no longer available for this table" });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      restaurantId,
      tableId,
      tableType: table.type,
      date,
      time,
      guests,
      specialRequests,
      status: "confirmed"
    });

    // Emit event for notification service
    await emitBookingCreated(booking);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
