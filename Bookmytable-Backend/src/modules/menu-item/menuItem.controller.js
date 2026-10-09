import {
  createMenuItemService,
  getMenuItemsService,
  updateMenuItemService,
  deleteMenuItemService,
} from "./menuItem.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";
import { calculateAndUpdateMenuMetrics } from "../menu/projection/menuProjection.service.js";

export const createMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];

    const item = await createMenuItemService(restaurantId, req.body, req.file);

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_CREATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { itemName: item.name, price: item.price },
      ipAddress: req.ip,
    });

    calculateAndUpdateMenuMetrics(restaurantId, item.brandId).catch((err) =>
      console.error("⚠️ Failed to update menu metrics:", err.message)
    );

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: item,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { categoryId } = req.query;

    const items = await getMenuItemsService(restaurantId, categoryId);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];
    const branchId = req.branchId;

    const item = await updateMenuItemService(itemId, req.body, req.file);

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_UPDATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId || item.restaurant || item.branch,
      metadata: { itemId, itemName: item.name },
      ipAddress: req.ip,
    });

    calculateAndUpdateMenuMetrics(branchId || item.restaurant || item.branch, item.brandId).catch((err) =>
      console.error("⚠️ Failed to update menu metrics:", err.message)
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: item,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?._id || req.user?.id || req.headers["x-user-id"];
    const branchId = req.branchId;

    const result = await deleteMenuItemService(itemId);

    // 📝 Log Action
    createLog({
      action: "MENU_ITEM_DELETED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { itemId },
      ipAddress: req.ip,
    });

    if (branchId) {
      calculateAndUpdateMenuMetrics(branchId).catch((err) =>
        console.error("⚠️ Failed to update menu metrics:", err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
