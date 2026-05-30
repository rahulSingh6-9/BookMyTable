import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import DiscoveryRestaurant from "./src/models/discovery.model.js";

async function run() {
  await connectDB();
  const idParam = "6a17ea30c649cc53fd8b8b62";
  const restaurant = await DiscoveryRestaurant.findOne({
    $or: [
      { _id: idParam },
      { restaurantId: idParam }
    ]
  }).lean();
  console.log("Result:", restaurant ? restaurant.name : "null");
  process.exit(0);
}
run();
