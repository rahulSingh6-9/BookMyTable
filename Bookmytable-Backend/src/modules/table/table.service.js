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
   
  // Graceful fallback for legacy tables created without floor/section
  const formattedTables = tables.map(t => {
    const doc = t.toObject ? t.toObject() : { ...t };
    if (!doc.floor) {
      doc.floor = "ground";
      doc.floorLabel = doc.floorLabel || "Ground Floor";
    } else if (!doc.floorLabel) {
      doc.floorLabel = doc.floor === "ground" ? "Ground Floor" : doc.floor.charAt(0).toUpperCase() + doc.floor.slice(1).replace(/_/g, " ");
    }
    if (!doc.section) {
      doc.section = "couple_zone";
      doc.sectionLabel = doc.sectionLabel || "Couple Zone";
    } else if (!doc.sectionLabel) {
      doc.sectionLabel = doc.section === "couple_zone" ? "Couple Zone" : doc.section === "family_zone" ? "Family Zone" : doc.section.charAt(0).toUpperCase() + doc.section.slice(1).replace(/_/g, " ");
    }
    return doc;
  });

  return formattedTables;
};


const getAreaTypeVariants = (type) => {
  if (!type) return ["indoor_dining", "indoor"];
  const map = {
    indoor_dining: ["indoor_dining", "indoor"],
    indoor: ["indoor_dining", "indoor"],
    outdoor_dining: ["outdoor_dining", "outdoor"],
    outdoor: ["outdoor_dining", "outdoor"],
    rooftop_dining: ["rooftop_dining", "rooftop"],
    rooftop: ["rooftop_dining", "rooftop"],
    private_room: ["private_room", "private"],
    private: ["private_room", "private"],
  };
  return map[type] || [type];
};

export const createTableService = async (branchId, userId, data) => {
  // 1. Branch check
  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  // 1b. Check SaaS table limits
  const { checkLimit } = await import("../subscriptions/subscription.service.js");
  const currentTablesCount = await Table.countDocuments({ brand: branch.brandId, isDeleted: { $ne: true }, isActive: true });
  await checkLimit(branch.brandId, "maxTables", currentTablesCount);

  // 1c. Resolve Pricing
  const pricingConfig = await DiningAreaPricing.findOne({
    branch: branchId,
    floor: data.floor,
    diningAreaType: { $in: getAreaTypeVariants(data.type) },
    sectionType: data.section
  });

  let resolvedPrice = 0;
  let priceSource = "none";
  let tablePriceOverride = undefined;

  if (data.price !== undefined && data.price !== null && data.price !== "") {
    resolvedPrice = Number(data.price);
    tablePriceOverride = Number(data.price);
    priceSource = "override";

    if (!pricingConfig && data.floor && data.section) {
      DiningAreaPricing.create({
        branch: branchId,
        floor: data.floor,
        diningAreaType: data.type || "indoor_dining",
        sectionType: data.section,
        price: Number(data.price),
        createdBy: userId,
        updatedBy: userId
      }).catch(err => console.error("Auto-created pricing config error:", err.message));
    }
  } else if (pricingConfig && pricingConfig.price !== undefined && pricingConfig.price !== null) {
    resolvedPrice = pricingConfig.price;
    priceSource = "dining_area_pricing";
  } else if (data.tablePriceOverride !== undefined && data.tablePriceOverride !== null) {
    resolvedPrice = Number(data.tablePriceOverride);
    tablePriceOverride = Number(data.tablePriceOverride);
    priceSource = "override";
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
    type: data.type || "indoor_dining",
    floor: data.floor,
    floorLabel: data.floorLabel,
    diningArea: data.diningArea || undefined,
    section: data.section,
    sectionLabel: data.sectionLabel,
    position: data.position,
    tablePriceOverride,
    priceSource,
    resolvedPrice,
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

  // Resolve Pricing
  const pricingConfig = await DiningAreaPricing.findOne({
    branch: branchId,
    floor: floor,
    diningAreaType: { $in: getAreaTypeVariants(type) },
    sectionType: section
  });

  let resolvedPrice = 0;
  let priceSource = "none";
  let tablePriceOverride = undefined;

  if (data.price !== undefined && data.price !== null && data.price !== "") {
    resolvedPrice = Number(data.price);
    tablePriceOverride = Number(data.price);
    priceSource = "override";

    if (!pricingConfig && floor && section) {
      DiningAreaPricing.create({
        branch: branchId,
        floor: floor,
        diningAreaType: type || "indoor_dining",
        sectionType: section,
        price: Number(data.price),
        createdBy: userId,
        updatedBy: userId
      }).catch(err => console.error("Auto-created pricing config error:", err.message));
    }
  } else if (pricingConfig && pricingConfig.price !== undefined && pricingConfig.price !== null) {
    resolvedPrice = pricingConfig.price;
    priceSource = "dining_area_pricing";
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
        tablePriceOverride,
        priceSource,
        resolvedPrice,
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
    diningAreaType: { $in: getAreaTypeVariants(updatedType) },
    sectionType: updatedSection
  });

  if (data.price !== undefined && data.price !== null && data.price !== "") {
    data.resolvedPrice = Number(data.price);
    data.tablePriceOverride = Number(data.price);
    data.priceSource = "override";
  } else if (data.tablePriceOverride !== undefined && data.tablePriceOverride !== null) {
    data.resolvedPrice = Number(data.tablePriceOverride);
    data.priceSource = "override";
  } else if (pricingConfig && pricingConfig.price !== undefined && pricingConfig.price !== null) {
    data.priceSource = "dining_area_pricing";
    data.resolvedPrice = pricingConfig.price;
  } else {
    data.priceSource = table.priceSource || "none";
    data.resolvedPrice = table.resolvedPrice || 0;
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
  table.isDeleted = true;
  await table.save();

  const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
  if (table.brand) recalculateUsage(table.brand).catch(err => console.error("Recalculate usage err:", err));

  return table;
};
