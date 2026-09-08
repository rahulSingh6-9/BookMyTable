import Table from '../../models/table.model.js';
import Restaurant from '../../models/restaurant.model.js';
import DiningAreaPricing from '../../models/diningAreaPricing.model.js';

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

  // 1b. Check SaaS table limits
  const { checkLimit } = await import("../subscriptions/subscription.service.js");
  const currentTablesCount = await Table.countDocuments({ brand: branch.brandId, isDeleted: { $ne: true }, isActive: true });
  await checkLimit(branch.brandId, "maxTables", currentTablesCount);

  // 1c. Verify Pricing Exists
  const pricingConfig = await DiningAreaPricing.findOne({
    branch: branchId,
    floor: data.floor,
    diningAreaType: data.type,
    sectionType: data.section
  });

  if (!pricingConfig || pricingConfig.price === undefined || pricingConfig.price === null) {
    const error = new Error("Pricing not configured for this Floor and Section. Please configure pricing first.");
    error.status = 400;
    throw error;
  }

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
    floorLabel: data.floorLabel,
    diningArea: data.diningArea || undefined,
    section: data.section,
    sectionLabel: data.sectionLabel,
    position: data.position,
    priceSource: "dining_area_pricing",
    resolvedPrice: pricingConfig.price,
    isActive: true,
  });

  const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
  recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));

  return table;
};

export const bulkGenerateTablesService = async (branchId, userId, data) => {
  const { prefix, capacity, type, floor, floorLabel, section, sectionLabel, quantity } = data;
  const qty = parseInt(quantity);
  const cap = parseInt(capacity);
  
  if (!prefix || isNaN(qty) || isNaN(cap) || qty < 1 || qty > 100 || cap < 1) {
    const error = new Error("Invalid parameters for bulk generation.");
    error.status = 400;
    throw error;
  }

  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  const { checkLimit } = await import("../subscriptions/subscription.service.js");
  const currentTablesCount = await Table.countDocuments({ brand: branch.brandId, isDeleted: { $ne: true }, isActive: true });
  await checkLimit(branch.brandId, "maxTables", currentTablesCount, qty);

  // Verify Pricing Exists
  const pricingConfig = await DiningAreaPricing.findOne({
    branch: branchId,
    floor: floor,
    diningAreaType: type || "indoor_dining",
    sectionType: section
  });

  if (!pricingConfig || pricingConfig.price === undefined || pricingConfig.price === null) {
    const error = new Error("Pricing not configured for this Floor and Section. Please configure pricing first.");
    error.status = 400;
    throw error;
  }

  // Fetch all existing table codes to prevent duplicates
  const existingTables = await Table.find({ branch: branchId, isActive: true }, 'tableCode');
  const existingCodes = new Set(existingTables.map(t => t.tableCode));

  const newTables = [];
  let addedCount = 0;
  let nextNum = 1;

  while (addedCount < qty) {
    const code = `${prefix}${nextNum}`;
    if (!existingCodes.has(code)) {
      newTables.push({
        branch: branchId,
        brand: branch.brandId,
        tableCode: code,
        capacity: cap,
        type: type || "indoor_dining",
        floor: floor,
        floorLabel: floorLabel,
        diningArea: data.diningArea || undefined,
        section: section,
        sectionLabel: sectionLabel,
        priceSource: "dining_area_pricing",
        resolvedPrice: pricingConfig.price,
        isActive: true,
      });
      addedCount++;
    }
    nextNum++;
  }

  const createdTables = await Table.insertMany(newTables);

  const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
  recalculateUsage(branch.brandId).catch(err => console.error("Recalculate usage err:", err));

  return createdTables;
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

  // Re-resolve pricing
  const updatedFloor = data.floor !== undefined ? data.floor : table.floor;
  const updatedType = data.type !== undefined ? data.type : table.type;
  const updatedSection = data.section !== undefined ? data.section : table.section;

  const pricingConfig = await DiningAreaPricing.findOne({
    branch: table.branch,
    floor: updatedFloor,
    diningAreaType: updatedType,
    sectionType: updatedSection
  });

  if (!pricingConfig || pricingConfig.price === undefined || pricingConfig.price === null) {
    const error = new Error("Pricing not configured for this Floor and Section. Please configure pricing first.");
    error.status = 400;
    throw error;
  }

  data.priceSource = "dining_area_pricing";
  data.resolvedPrice = pricingConfig.price;

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
  table.isDeleted = true;
  await table.save();

  const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
  if (table.brand) recalculateUsage(table.brand).catch(err => console.error("Recalculate usage err:", err));

  return table;
};