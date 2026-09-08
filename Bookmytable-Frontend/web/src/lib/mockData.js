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

export const restaurantLayouts = {
  "1": {
    rooms: [
      {
        id: "r1",
        name: "Main Hall",
        layout: {
          tables: [
            { _id: "t1", restaurant: "1", tableNumber: "T-01", capacity: 2, type: "indoor", isActive: true, position: { x: 100, y: 100 } },
            { _id: "t2", restaurant: "1", tableNumber: "T-02", capacity: 4, type: "indoor", isActive: true, position: { x: 250, y: 100 } },
            { _id: "t5", restaurant: "1", tableNumber: "T-05", capacity: 8, type: "indoor", isActive: true, position: { x: 150, y: 250 } },
          ],
          elements: [
            { id: "e1", type: "wall", position: { x: 50, y: 50 }, size: { width: 400, height: 10 } },
            { id: "e2", type: "door", position: { x: 250, y: 50 }, size: { width: 60, height: 10 } },
          ]
        }
      },
      {
        id: "r2",
        name: "Outdoor Patio",
        layout: {
          tables: [
            { _id: "t3", restaurant: "1", tableNumber: "T-03", capacity: 6, type: "outdoor", isActive: true, position: { x: 150, y: 150 } },
            { _id: "t6", restaurant: "1", tableNumber: "T-06", capacity: 4, type: "outdoor", isActive: true, position: { x: 300, y: 200 } },
          ],
          elements: [
            { id: "e3", type: "plant", position: { x: 50, y: 50 }, size: { width: 40, height: 40 } },
          ]
        }
      },
      {
        id: "r3",
        name: "VIP Lounge",
        layout: {
          tables: [
            { _id: "t4", restaurant: "1", tableNumber: "T-04", capacity: 2, type: "vip", isActive: true, position: { x: 200, y: 150 } },
          ],
          elements: []
        }
      }
    ]
  }
};

// Legacy fallback export to prevent immediate crashes in components yet to be migrated
export const restaurantTables = {
  "1": restaurantLayouts["1"].rooms.flatMap((r) => r.layout.tables)
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
  { value: "indoor_dining", label: "Indoor Dining" },
  { value: "outdoor_dining", label: "Outdoor Dining" },
  { value: "rooftop_dining", label: "Rooftop Dining" },
  { value: "private_room", label: "Private Room" },
];
