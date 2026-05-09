import Table from '../../models/table.model.js';
import Restaurant from '../../models/restaurant.model.js';

export const getTableServices = async (restaurantId, userId) => {
  // 1. Validate restaurant exists and user is the owner
  const restaurant = await Restaurant.findById(restaurantId);
  console.log("Backend restaurantId:", restaurant._id)   //****Testing

  if (!restaurant) {
    const error = new Error("Restaurant not found");
    error.status = 404;
    throw error;
  }

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized: You do not own this restaurant");
    error.status = 403;
    throw error;
  }

  // 2. Fetch active tables sorted by tableCode
  const tables = await Table.find({
    restaurant: restaurantId,
    isActive: true,
  }).sort({ tableCode: 1 });
   
  console.log(tables)
  return tables;
};


export const createTableService = async (restaurantId, userId, data) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) throw new Error("Restaurant not found");

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  const table = await Table.create({
    restaurant: restaurantId,
    tableCode: data.tableCode,
    capacity: data.capacity,
    type: data.type,
    floor: data.floor,
    section: data.section,
    position: data.position,
    isActive: true, // 🔥 important
  });

  return table;
};


export const updateTableService = async (tableId, userId, data) => {
  const table = await Table.findById(tableId);

  if (!table) {
    const err = new Error("Table not found");
    err.status = 404;
    throw err;
  }

  // 🔥 Ownership check
  const restaurant = await Restaurant.findById(table.restaurant);

  if (!restaurant || restaurant.owner.toString() !== userId) {
    const err = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }

  // 🔥 Prevent duplicate tableCode
  if (data.tableCode) {
    const existing = await Table.findOne({
      restaurant: table.restaurant,
      tableCode: data.tableCode,
      _id: { $ne: tableId },
    });

    if (existing) {
      const err = new Error("Table code already exists");
      err.status = 400;
      throw err;
    }
  }

  Object.assign(table, data);
  await table.save();

  return table;
};


export const deleteTableService = async (tableId, userId) => {
  const table = await Table.findById(tableId);

  if (!table) {
    const err = new Error("Table not found");
    err.status = 404;
    throw err;
  }

  const restaurant = await Restaurant.findById(table.restaurant);

  if (!restaurant || restaurant.owner.toString() !== userId) {
    const err = new Error("Unauthorized");
    err.status = 403;
    throw err;
  }

  // 🔥 Soft delete
  table.isActive = false;
  await table.save();

  return table;
};