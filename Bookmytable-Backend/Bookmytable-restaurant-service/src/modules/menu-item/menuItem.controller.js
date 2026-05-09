import {
  createMenuItemService,
  getMenuItemsService,
  updateMenuItemService,
  deleteMenuItemService,
} from "./menuItem.service.js";
import { createLog } from "../log/log.service.js";

// ✅ CREATE
export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await createMenuItemService(
      restaurantId,
      userId,
      req.body,
      req.file
    );

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_CREATED",
      performedBy: userId,
      role: req.headers["x-user-role"],
      restaurant: restaurantId,
      metadata: { name: req.body.name, price: req.body.price },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Item created",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET
export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { categoryId } = req.query;
    const userId = req.headers["x-user-id"];

    const result = await getMenuItemsService(
      restaurantId,
      userId,
      categoryId
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE
export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await updateMenuItemService(
      itemId,
      userId,
      req.body,
      req.file
    );

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_UPDATED",
      performedBy: userId,
      role: req.headers["x-user-role"],
      restaurant: result.restaurant,
      metadata: { itemId, updates: req.body },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: "Item updated",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE
export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await deleteMenuItemService(itemId, userId);

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_DELETED",
      performedBy: userId,
      role: req.headers["x-user-role"],
      restaurant: result.restaurantId,
      metadata: { itemId },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};