import { getTableServices, createTableService, updateTableService, deleteTableService } from "./table.service.js";
import { createLog } from "../log/log.service.js";

export const getTables = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    console.log(restaurantId)
    
    const userId = req.user.id;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    const result = await getTableServices(restaurantId, userId);

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
      role: req.headers["x-user-role"] || req.user?.role,
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
    next(error)
  }
};

export const updateTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.headers["x-user-id"] || req.user?.id;

    const result = await updateTableService(tableId, userId, req.body);

    // 📝 Log Action
    createLog({
      action: "TABLE_UPDATED",
      performedBy: userId,
      role: req.headers["x-user-role"] || req.user?.role,
      restaurant: result.restaurant,
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
    const userId = req.headers["x-user-id"] || req.user?.id;

    const table = await deleteTableService(tableId, userId);

    // 📝 Log Action
    createLog({
      action: "TABLE_DELETED",
      performedBy: userId,
      role: req.headers["x-user-role"] || req.user?.role,
      restaurant: table?.restaurant,
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
