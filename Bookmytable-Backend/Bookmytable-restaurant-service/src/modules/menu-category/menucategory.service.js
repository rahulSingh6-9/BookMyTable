// src/services/menuCategory.service.js

import MenuCategory from "../../models/menuCategory.model.js";
import Restaurant from "../../models/restaurant.model.js";

// ✅ CREATE CATEGORY
export const createCategoryService = async (restaurantId, userId, data) => {
  // 🔥 1. Check restaurant ownership
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  // 🔥 2. Create category
  const category = await MenuCategory.create({
    ...data,
    restaurant: restaurantId,
  });

  return category;
};

// ✅ GET ALL CATEGORIES
export const getCategoriesService = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) throw new Error("Restaurant not found");

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  const categories = await MenuCategory.find({
    restaurant: restaurantId,
    isActive: true,
  }).sort({ order: 1 });

  return categories;
};

// ✅ UPDATE CATEGORY
export const updateCategoryService = async (categoryId, userId, data) => {
  const category = await MenuCategory.findById(categoryId);

  if (!category) throw new Error("Category not found");

  const restaurant = await Restaurant.findById(category.restaurant);

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  Object.assign(category, data);
  await category.save();

  return category;
};

// ✅ DELETE CATEGORY (soft delete)
export const deleteCategoryService = async (categoryId, userId) => {
  const category = await MenuCategory.findById(categoryId);

  if (!category) throw new Error("Category not found");

  const restaurant = await Restaurant.findById(category.restaurant);

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  category.isActive = false;
  await category.save();

  return { message: "Category deleted" };
};