import { getTableServices, createTableService, updateTableService, deleteTableService, bulkGenerateTablesService } from "./table.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";

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
    const userId = req.user.id;

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

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
      code: error.code || "BAD_REQUEST"
    });
  }
};

export const bulkGenerateTables = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;
    
    const createdTables = await bulkGenerateTablesService(restaurantId, userId, req.body);

    // 📝 Log Action
    createLog({
      action: "TABLES_BULK_GENERATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { prefix: req.body.prefix, quantity: req.body.quantity, createdCount: createdTables.length },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: `${createdTables.length} tables generated successfully`,
      created: createdTables.length,
      data: createdTables,
    });
  } catch (error) {
    res.status(error.status || 400).json({
      success: false,
      message: error.message,
      code: error.code || "BAD_REQUEST"
    });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;
    const branchId = req.branchId;

    const result = await updateTableService(tableId, req.body);

    // 📝 Log Action
    createLog({
      action: "TABLE_UPDATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { tableId, updates: req.body },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;
    const branchId = req.branchId;

    const table = await deleteTableService(tableId);

    // 📝 Log Action
    createLog({
      action: "TABLE_DELETED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { tableId },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
