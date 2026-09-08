import Booking from "../../models/booking.model.js";
import RestaurantBranch from "../../models/restaurant.model.js";
import RestaurantSettings from "../../models/restaurantSettings.model.js";
import Table from "../../models/table.model.js";
import { emitBookingCreated } from "../../kafka/producers/booking.producer.js";
import { checkReservationLimits, incrementReservationUsage } from "../subscriptions/subscription.service.js";

export const createReservation = async (userId, data) => {
  const { restaurantId, tableId, tables, slot, date, guests, specialRequests } = data;
  const time = slot || data.time;

  // Normalize legacy singular table to the new tables array format
  const selectedTables = tables && tables.length > 0 
    ? tables 
    : (tableId ? [{ tableId, tableType: data.tableType, tableName: data.tableName }] : []);

  if (selectedTables.length === 0 || !time || !date || !guests) {
    throw new Error("Missing required booking details (tables, time, date, guests)");
  }

  // 1. Fetch Local Models Natively
  const branch = await RestaurantBranch.findOne({ _id: restaurantId, isActive: true, isDeleted: false }).lean();
  if (!branch) {
    throw new Error("Restaurant configuration not found or inactive");
  }
  
  const settings = await RestaurantSettings.findOne({ branch: restaurantId }).lean();

  const slotDuration = settings?.slotDuration || 60;
  const buffer = settings?.tableBufferMinutes || 15;
  const totalOccupancyMinutes = slotDuration + buffer;

  const [reqH, reqM] = time.split(':').map(Number);
  const reqSlotStart = reqH * 60 + reqM;
  const reqSlotEnd = reqSlotStart + totalOccupancyMinutes;

  // We will accumulate verified table details
  const verifiedTables = [];
  let totalCapacity = 0;

  for (const t of selectedTables) {
    const tableRecord = await Table.findOne({ _id: t.tableId, branch: restaurantId, isActive: true }).lean();
    if (!tableRecord) {
      throw new Error(`Selected table ${t.tableName || t.tableId} not found in restaurant`);
    }

    totalCapacity += tableRecord.capacity;

    // Validate Slot Availability for THIS specific table
    const existingBookings = await Booking.find({ 
      restaurantId, 
      date, 
      status: "confirmed",
      "tables.tableId": t.tableId // Match inside the array
    }).lean();

    // Also check legacy `tableId` for backwards compatibility
    const legacyBookings = await Booking.find({
      restaurantId,
      date,
      status: "confirmed",
      tableId: t.tableId
    }).lean();

    const allBookings = [...existingBookings, ...legacyBookings];

    let isOverlapping = false;
    for (const b of allBookings) {
      const [h, m] = b.time.split(':').map(Number);
      const bStart = h * 60 + m;
      const bEnd = bStart + totalOccupancyMinutes;

      if (bStart < reqSlotEnd && bEnd > reqSlotStart) {
        isOverlapping = true;
        break;
      }
    }

    if (isOverlapping) {
      throw new Error(`Selected slot is no longer available for table ${t.tableName || tableRecord.name}`);
    }

    verifiedTables.push({
      tableId: tableRecord._id,
      tableName: tableRecord.name,
      tableType: tableRecord.type,
      tablePrice: tableRecord.resolvedPrice || tableRecord.price || 0,
      sectionLabel: tableRecord.sectionLabel || "Main Area",
      floorLabel: tableRecord.floorLabel || "Main Floor"
    });
  }

  if (totalCapacity < Number(guests)) {
    throw new Error(`Total table capacity (${totalCapacity}) is too small for this party size (${guests})`);
  }

  // 3. Subscription Limits (natively)
  try {
    await checkReservationLimits(branch.brandId, restaurantId);
  } catch (err) {
    if (err.message && err.message.includes("limit exceeded")) {
      throw err;
    }
    // ignore if no limit found temporarily
  }

  // 4. Create Booking
  // Calculate total price based on verified tables plus existing totals from payload
  const tablePriceTotal = verifiedTables.reduce((sum, t) => sum + t.tablePrice, 0);
  
  const booking = await Booking.create({
    userId,
    restaurantId,
    // Store array instead of singular (can also optionally set the first one for legacy fallback)
    tables: verifiedTables,
    tableId: verifiedTables[0]?.tableId, // Legacy fallback
    tableType: verifiedTables[0]?.tableType, // Legacy fallback
    tableName: verifiedTables[0]?.tableName, // Legacy fallback
    date,
    time,
    guests,
    specialRequests: data.specialRequests,
    status: "confirmed",
    // Override financials if needed, or trust payload for now (payload has tax/food/grand)
    tablePrice: tablePriceTotal,
    foodTotal: data.foodTotal || 0,
    tax: data.tax || 0,
    grandTotal: data.grandTotal || tablePriceTotal,
    currency: data.currency || "INR",
    paymentStatus: data.paymentStatus || "pending",
    paymentMethod: data.paymentMethod || "pay_at_restaurant"
  });

  // 5. Emit Events & Metrics
  await emitBookingCreated(booking);
  
  try {
    await incrementReservationUsage(branch.brandId, restaurantId);
  } catch(err) {
    console.error("Failed to increment usage", err);
  }

  return booking;
};
