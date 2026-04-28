import { useState, useCallback } from "react";
import { mockBookings } from "@/lib/mockData";

export function useBookings(restaurantId) {
  const [bookings, setBookings] = useState(
    restaurantId ? mockBookings.filter((b) => b.restaurant === restaurantId) : mockBookings
  );

  const addBooking = useCallback((booking) => {
    const newBooking = {
      ...booking,
      _id: `b${Date.now()}`,
      status: "pending",
      paymentStatus: "pending",
      bookingSource: "app",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [...prev, newBooking]);
    return newBooking;
  }, []);

  const updateBookingStatus = useCallback((bookingId, status) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
    );
  }, []);

  return { bookings, addBooking, updateBookingStatus };
}
