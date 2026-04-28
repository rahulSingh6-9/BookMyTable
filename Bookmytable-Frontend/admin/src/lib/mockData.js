// Mock data matching the updated database schema

export const restaurantSettings = {
  "1": {
    _id: "rs1",
    restaurant: "1",
    openingHours: {
      monday: { isOpen: true, slots: [{ open: "11:00", close: "14:00" }, { open: "17:30", close: "23:00" }] },
      tuesday: { isOpen: true, slots: [{ open: "11:00", close: "14:00" }, { open: "17:30", close: "23:00" }] },
      wednesday: { isOpen: true, slots: [{ open: "11:00", close: "14:00" }, { open: "17:30", close: "23:00" }] },
      thursday: { isOpen: true, slots: [{ open: "11:00", close: "14:00" }, { open: "17:30", close: "23:00" }] },
      friday: { isOpen: true, slots: [{ open: "11:00", close: "14:00" }, { open: "17:30", close: "23:30" }] },
      saturday: { isOpen: true, slots: [{ open: "12:00", close: "23:30" }] },
      sunday: { isOpen: false, slots: [] },
    },
    specialDays: [
      { date: "2026-04-01", isOpen: false },
      { date: "2026-03-29", slots: [{ open: "10:00", close: "18:00" }] },
    ],
    timeSlotInterval: 30,
    minGuestsPerBooking: 1,
    maxGuestsPerBooking: 10,
    advanceBookingDays: 30,
    cancellationPolicy: "Free cancellation up to 2 hours before",
    autoAcceptBookings: true,
    depositRequired: false,
    depositAmount: 0,
  },
};

export const restaurantTables = {
  "1": [
    { _id: "t1", restaurant: "1", tableNumber: "T-01", capacity: 2, type: "indoor", isActive: true },
    { _id: "t2", restaurant: "1", tableNumber: "T-02", capacity: 4, type: "indoor", isActive: true },
    { _id: "t3", restaurant: "1", tableNumber: "T-03", capacity: 6, type: "outdoor", isActive: true },
    { _id: "t4", restaurant: "1", tableNumber: "T-04", capacity: 2, type: "vip", isActive: true },
    { _id: "t5", restaurant: "1", tableNumber: "T-05", capacity: 8, type: "indoor", isActive: false },
    { _id: "t6", restaurant: "1", tableNumber: "T-06", capacity: 4, type: "outdoor", isActive: true },
  ],
};

export const mockBookings = [
  {
    _id: "b1",
    user: "u1",
    restaurant: "1",
    table: "t1",
    date: "2026-03-27",
    time: "19:00",
    guests: 2,
    status: "confirmed",
    paymentStatus: "paid",
    bookingSource: "app",
    specialRequest: "",
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    _id: "b2",
    user: "u2",
    restaurant: "1",
    table: "t2",
    date: "2026-03-27",
    time: "20:00",
    guests: 4,
    status: "pending",
    paymentStatus: "pending",
    bookingSource: "app",
    specialRequest: "Window seat preferred",
    createdAt: "2026-03-26T08:30:00Z",
  },
];

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const TABLE_TYPES = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "vip", label: "VIP" },
];
