// src/controllers/menuCategory.controller.js

import {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  deleteCategoryService,
} from "../services/menuCategory.service.js";

// ✅ CREATE
export const createCategory = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await createCategoryService(
      restaurantId,
      userId,
      req.body
    );
    console.log("create menu:", result)
    res.status(201).json({
      success: true,
      message: "Category created",
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
export const getCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await getCategoriesService(restaurantId, userId);

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
export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await updateCategoryService(
      categoryId,
      userId,
      req.body
    );

    res.json({
      success: true,
      message: "Category updated",
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
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.headers["x-user-id"];

    const result = await deleteCategoryService(categoryId, userId);

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