import dotenv from 'dotenv'
dotenv.config()

import axios from "axios";
import { syncUser } from '../kafka/handlers/userSync.handler.js';
import UserReadModel from "../models/userReadModel.js";
import { syncRestaurant } from '../kafka/handlers/restaurantSync.handler.js'; 
import RestaurantReadModel from "../models/restaurantReadModel.js";

export const initialUserSync = async () => {
  const count = await UserReadModel.countDocuments();

  // ❗ Skip if already synced
  if (count > 0) {
    console.log("⏭️ Initial sync skipped (data already exists)");
    return;
  }

  console.log("🔄 Starting initial user sync...");

  let page = 1;
  const limit = 100;

  while (true) {
    const headers = {};
    if (process.env.INTERNAL_API_TOKEN) {
      headers["x-internal-token"] = process.env.INTERNAL_API_TOKEN;
    }

    const res = await axios.get(
      `${process.env.USER_SERVICE_URL}/internal/users/export?page=${page}&limit=${limit}`,
      { headers }
    );

    const users = res.data.data;
    console.log("👀 Users fetched:", users.length);

    const hasMore = res.data?.meta?.hasMore;

    if (!users || users.length === 0) break;

    // 🔥 Parallel safe sync
    await Promise.all(users.map(user => syncUser(user)));

    console.log(`✅ Synced page ${page}`);

    // Stop if the exporter tells us there are no more pages
    if (hasMore === false) break;

    // Fallback stop condition if meta missing
    if (users.length < limit) break;

    page++;
  }

  console.log("🎉 Initial sync completed");
};


export const initialRestaurantSync = async () => {
  const count = await RestaurantReadModel.countDocuments();

  // ❗ Skip if already synced
  if (count > 0) {
    console.log("⏭️ Initial restaurant sync skipped");
    return;
  }

  console.log("🔄 Starting initial restaurant sync...");

  let page = 1;
  const limit = 100;

  while (true) {
    const headers = {};
    if (process.env.INTERNAL_API_TOKEN) {
      headers["x-internal-token"] = process.env.INTERNAL_API_TOKEN;
    }

    const res = await axios.get(
      `${process.env.RESTAURANT_SERVICE_URL}/internal/restaurants/export?page=${page}&limit=${limit}`,
      { headers }
    );

    const restaurants = res.data.data;

    console.log("👀 Restaurants fetched:", restaurants.length);

    const hasMore = res.data?.meta?.hasMore;

    if (!restaurants || restaurants.length === 0) break;

    await Promise.all(restaurants.map(r => syncRestaurant(r)));

    console.log(`✅ Synced restaurant page ${page}`);

    if (hasMore === false) break;
    if (restaurants.length < limit) break;

    page++;
  }

  console.log("🎉 Initial restaurant sync completed");
};