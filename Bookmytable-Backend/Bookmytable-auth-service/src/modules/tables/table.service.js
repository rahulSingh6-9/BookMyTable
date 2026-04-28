import Table from "../../models/table.model.js";
import Restaurant from "../../models/restaurants.model.js";

// 🔥 CREATE TABLE
export const createTableService = async (data, ownerId) => {
  const { restaurant, tableNumber, capacity, type } = data;

  // ✅ Check restaurant exists
  const restaurantDoc = await Restaurant.findById(restaurant);
  if (!restaurantDoc) {
    throw new Error("Restaurant not found");
  }

  // ✅ Check ownership
  if (restaurantDoc.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized");
  }

  // ✅ Create table
  const table = await Table.create({
    restaurant,
    tableNumber,
    capacity,
    type,
  });

  return table;
};

// 🔥 GET TABLES BY RESTAURANT
export const getTablesByRestaurantService = async (restaurantId) => {
  return await Table.find({
    restaurant: restaurantId,
    isActive: true,
  }).sort({ tableNumber: 1 });
};

// 🔥 DELETE TABLE
export const deleteTableService = async (tableId, ownerId) => {
  const table = await Table.findById(tableId).populate("restaurant");

  if (!table) {
    throw new Error("Table not found");
  }

  // ✅ Check ownership
  if (table.restaurant.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized");
  }

  await table.deleteOne();

  return true;
};

// 🔥 UPDATE TABLE STATUS
export const updateTableStatusService = async (tableId, status, ownerId) => {
  const table = await Table.findById(tableId).populate("restaurant");

  if (!table) {
    throw new Error("Table not found");
  }

  // ✅ Check ownership
  if (table.restaurant.owner.toString() !== ownerId.toString()) {
    throw new Error("Unauthorized");
  }

  table.status = status;
  await table.save();

  return table;
};
