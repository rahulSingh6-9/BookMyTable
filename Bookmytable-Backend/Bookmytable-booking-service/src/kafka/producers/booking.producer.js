import { producer } from "../config/kafka.js";
import { BOOKING_TOPICS } from "../topics/booking.topics.js";

export const emitBookingCreated = async (bookingData) => {
  try {
    await producer.send({
      topic: BOOKING_TOPICS.BOOKING_CREATED,
      messages: [
        {
          key: String(bookingData._id),
          value: JSON.stringify({
            eventId: `evt_${Date.now()}`,
            type: "BOOKING_CREATED",
            timestamp: new Date().toISOString(),
            payload: bookingData,
          }),
        },
      ],
    });
    console.log("📡 Emitted booking.created event");
  } catch (error) {
    console.error("❌ Failed to emit booking event", error);
  }
};
