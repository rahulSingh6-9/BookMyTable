import {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "./menuCategory.service.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";
import {
  emitMenuCategoryCreated,
  emitMenuCategoryUpdated,
  emitMenuCategoryDeleted,
} from "../../kafka/producers/restaurant.producer.js";

// ✅ CREATE
export const createCategory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;
    console.log("createCategory data:",req.body)

    const result = await createCategoryService(restaurantId, req.body);

    // 📝 Log Action
    createLog({
      action: "MENU_CATEGORY_CREATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: restaurantId,
      metadata: { categoryName: result.name },
      ipAddress: req.ip,
    });

    // 📢 Emit Kafka Event
    await emitMenuCategoryCreated(result);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ GET
export const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const result = await getCategoriesService(restaurantId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;
    const branchId = req.branchId;

    const result = await updateCategoryService(categoryId, req.body);

    // 📝 Log Action
    createLog({
      action: "MENU_CATEGORY_UPDATED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId || result.branch,
      metadata: { categoryId, categoryName: result.name },
      ipAddress: req.ip,
    });

    // 📢 Emit Kafka Event
    await emitMenuCategoryUpdated(result);

    res.json({
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ DELETE
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;
    const branchId = req.branchId;

    const result = await deleteCategoryService(categoryId);

    // 📝 Log Action
    createLog({
      action: "MENU_CATEGORY_DELETED",
      performedBy: userId,
      role: req.activeRole || ROLES.OWNER,
      restaurant: branchId,
      metadata: { categoryId },
      ipAddress: req.ip,
    });

    // 📢 Emit Kafka Event
    await emitMenuCategoryDeleted({ _id: categoryId, branch: branchId });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};