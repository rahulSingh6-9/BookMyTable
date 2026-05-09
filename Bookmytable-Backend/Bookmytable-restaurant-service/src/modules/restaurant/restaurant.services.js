import Restaurant from '../../models/restaurant.model.js'
import { emitRestaurantCreated } from "../../kafka/index.js";

export const getMyRestaurantService = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");
    error.status = 400;
    throw error;
  }

  const restaurant = await Restaurant.findOne({ owner: userId });

  if (!restaurant) {
    const error = new Error("No restaurant found for this owner");
    error.status = 404;
    throw error;
  }

  return restaurant;
};


/**
 * CREATE RESTAURANT
 */
export const createRestaurant = async (data, userId) => {
  const { name } = data;

  // STEP 1: prevent duplicate restaurant per owner
  const existing = await Restaurant.findOne({
    name,
    owner: userId,
  });

  if (existing) {
    throw new Error("Restaurant already exists for this owner");
  }

  // STEP 2: create restaurant
  const restaurant = await Restaurant.create({
    ...data,
    owner: userId,
  });

  // 📡 Emit State Change Event for Admin Service (and others)
  await emitRestaurantCreated(restaurant, userId);


  return restaurant;
}


export const getAllRestaurants = async (query) => {
  const { page = 1, limit = 10, city, cuisine } = query;

  const filter = { isActive: true };

  if (city) filter.city = city;
  if (cuisine) filter.cuisine = cuisine;

  const restaurants = await Restaurant.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  return restaurants;
};


