import Log from "../../models/log.model.js";

export const createLog = async ({
  entityType = "branch",
  brandId,
  entityId,
  action,
  performedBy,
  role,
  restaurant,
  metadata = {},
  ipAddress,
}) => {
  try {
    return await Log.create({
      entityType,
      brandId,
      entityId,
      action,
      performedBy,
      role,
      restaurant,
      metadata,
      ipAddress,
    });
  } catch (err) {
    // 🚨 IMPORTANT: never break main flow due to logging failure
    console.error("Log Error:", err.message);
  }
};


export const getLogsService = async ({
  restaurantId,
  action,
  performedBy,
  startDate,
  endDate,
  limit = 50,
}) => {
  const filter = { restaurant: restaurantId };

  if (action) filter.action = action;
  if (performedBy) filter.performedBy = performedBy;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  return await Log.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
};


export const getBrandLogsService = async ({
  brandId,
  action,
  performedBy,
  startDate,
  endDate,
  limit = 50,
}) => {
  const filter = { entityType: "brand", brandId };

  if (action) filter.action = action;
  if (performedBy) filter.performedBy = performedBy;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  return await Log.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit);
};

