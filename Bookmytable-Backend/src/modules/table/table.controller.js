import {
  getTableServices,
  createTableService,
  updateTableService,
  deleteTableService,
  bulkGenerateTablesService,
} from "./table.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";
import { recalculateTableStats } from "./projection/tableProjection.service.js";

export const getTables = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    const result = await getTableServices(restaurantId);

    res.status(200).json({
      success: true,
      message: "Tables fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const createTable = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];

    const result = await createTableService(restaurantId, userId, req.body);

    // 📝 Log Action
    createLog({
      action: "TABLE_CREATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { tableCode: req.body.tableCode, capacity: req.body.capacity },
      ipAddress: req.ip,
    });

    // In-process recalculation
    recalculateTableStats(restaurantId).catch((err) =>
      console.error("⚠️ Failed to update table stats:", err.message)
    );

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
      code: error.code || "BAD_REQUEST",
    });
  }
};

export const bulkGenerateTables = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];

    const result = await bulkGenerateTablesService(restaurantId, userId, req.body);

    createLog({
      action: "TABLE_BULK_GENERATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { count: result.length },
      ipAddress: req.ip,
    });

    recalculateTableStats(restaurantId).catch((err) =>
      console.error("⚠️ Failed to update table stats:", err.message)
    );

    res.status(201).json({
      success: true,
      message: `${result.length} tables generated successfully`,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
      code: error.code || "BAD_REQUEST",
    });
  }
};

export const updateTable = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];

    const result = await updateTableService(tableId, userId, req.body);

    createLog({
      action: "TABLE_UPDATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: result.branch,
      metadata: { tableId, changes: req.body },
      ipAddress: req.ip,
    });

    recalculateTableStats(result.branch).catch((err) =>
      console.error("⚠️ Failed to update table stats:", err.message)
    );

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTable = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];

    const result = await deleteTableService(tableId, userId);

    createLog({
      action: "TABLE_DELETED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: result.branch,
      metadata: { tableId, tableCode: result.tableCode },
      ipAddress: req.ip,
    });

    recalculateTableStats(result.branch).catch((err) =>
      console.error("⚠️ Failed to update table stats:", err.message)
    );

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
    });
  }
};

