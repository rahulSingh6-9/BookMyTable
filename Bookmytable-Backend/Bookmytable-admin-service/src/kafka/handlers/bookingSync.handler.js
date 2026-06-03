import UserReadModel from "../../models/userReadModel.js";
import BrandReadModel from "../../models/brandReadModel.js";
import BranchReadModel from "../../models/branchReadModel.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

export const syncBooking = async (topic, data) => {
  const { userId, brandId, branchId } = data;

  if (!userId && !brandId && !branchId) {
    console.error("❌ Invalid booking payload, missing relations:", data);
    return;
  }

  // Determine increment value based on topic
  // Bookings completed or created might increment, cancelled might decrement depending on metric logic.
  // We'll increment for CREATED, decrement for CANCELLED.
  const incValue = topic === KAFKA_TOPICS.BOOKING_CREATED ? 1 : 
                   topic === KAFKA_TOPICS.BOOKING_CANCELLED ? -1 : 0;

  if (incValue !== 0) {
    if (userId) {
      await UserReadModel.findByIdAndUpdate(userId, { $inc: { bookingsCount: incValue } });
    }
    if (brandId) {
      await BrandReadModel.findByIdAndUpdate(brandId, { $inc: { bookingsCount: incValue } });
    }
    if (branchId) {
      await BranchReadModel.findByIdAndUpdate(branchId, { $inc: { bookingsCount: incValue } });
    }
  }

  console.log(`📅 Read-Model Synced: Booking [${topic}] metric updated.`);
};
