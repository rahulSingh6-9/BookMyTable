import Table from '../../models/table.model.js';
import Restaurant from '../../models/restaurant.model.js';

export const getTableServices = async (branchId) => {
  // Authorization is now handled by RBAC middleware
  
  const branch = await Restaurant.findById(branchId);
  if (!branch) {
    const error = new Error("Branch not found");
    error.status = 404;
    throw error;
  }

  // Fetch active tables sorted by tableCode
  const tables = await Table.find({
    branch: branchId,
    isActive: true,
  }).sort({ tableCode: 1 });
   
  return tables;
};


export const createTableService = async (branchId, userId, data) => {
  // 1. Branch check
  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  // 2. Check for duplicate tableCode in this branch
  const existingTable = await Table.findOne({
    branch: branchId,
    tableCode: data.tableCode,
    isActive: true, // Only check active tables
  });

  if (existingTable) {
    const error = new Error(`Table with code "${data.tableCode}" already exists in this branch.`);
    error.status = 400;
    throw error;
  }

  // 3. Create table
  const table = await Table.create({
    branch: branchId,
    brand: branch.brandId,
    tableCode: data.tableCode,
    capacity: data.capacity,
    type: data.type,
    floor: data.floor,
    section: data.section,
    position: data.position,
    isActive: true,
  });

  return table;
};


export const updateTableService = async (tableId, data) => {
  const table = await Table.findById(tableId);

  if (!table) {
    const err = new Error("Table not found");
    err.status = 404;
    throw err;
  }

  // Prevent duplicate tableCode
  if (data.tableCode) {
    const existing = await Table.findOne({
      branch: table.branch,
      tableCode: data.tableCode,
      _id: { $ne: tableId },
    });

    if (existing) {
      const err = new Error("Table code already exists in this branch");
      err.status = 400;
      throw err;
    }
  }

  Object.assign(table, data);
  await table.save();

  return table;
};


export const deleteTableService = async (tableId) => {
  const table = await Table.findById(tableId);

  if (!table) {
    const err = new Error("Table not found");
    err.status = 404;
    throw err;
  }

  // Soft delete
  table.isActive = false;
  await table.save();

  return table;
};