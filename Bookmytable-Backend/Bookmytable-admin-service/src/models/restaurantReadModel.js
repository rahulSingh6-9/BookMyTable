import mongoose from "mongoose";

const restaurantReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Map to original restaurantId
    name: { type: String },
    owner: { type: String },
    status: { type: String },
    city: { type: String },
    cuisine: { type: String },
    isActive: { type: Boolean },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const RestaurantReadModel = mongoose.model("RestaurantReadModel", restaurantReadSchema);
export default RestaurantReadModel;
