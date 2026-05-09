import { notificationService } from "../../services/notification.service.js";
import { logInfo, logError } from "../../utils/logger.js";

/**
 * Handles BOOKING_CREATED event
 */
export const handleBookingNotification = async (event) => {
  try {
    const { email, restaurantName, date, guests, bookingId } = event.payload || event;

    logInfo("📥 Received Booking Created Kafka Event", { email, restaurantName });

    await notificationService.processNotification({
      type: "email",
      event: "booking.confirmed",
      recipient: email,
      payload: event,
      metadata: { restaurantName, bookingDate: date, guests, bookingId }
    });

  } catch (error) {
    logError("❌ Booking Notification Kafka Handler Error", { error: error.message });
  }
};
