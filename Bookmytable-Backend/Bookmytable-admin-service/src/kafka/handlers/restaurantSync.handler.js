import RestaurantReadModel from "../../models/restaurantReadModel.js";

export const syncRestaurant = async (data) => {
  const restaurantId = data?.id || data?._id || data?.restaurantId;

  if (!restaurantId) {
    console.error("❌ No restaurant ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await RestaurantReadModel.findById(restaurantId);

  // Prevent stale overwrite
  if (existing && existing.updatedAt && incomingUpdatedAt <= existing.updatedAt) {
    console.log(`⏭️ Stale update skipped for restaurant ${restaurantId}`);
    return;
  }

  // Clean data for read model
  const { __v, ...safeData } = data;

  await RestaurantReadModel.findByIdAndUpdate(
    restaurantId,
    {
      $set: {
        ...safeData,
        _id: restaurantId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🏪 Read-Model Synced: Restaurant ${restaurantId} (${data.status || 'unknown'})`);
};
