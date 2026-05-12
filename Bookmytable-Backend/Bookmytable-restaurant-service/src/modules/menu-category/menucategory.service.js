import MenuCategory from "../../models/menuCategory.model.js";
import MenuItem from "../../models/menuItem.model.js";
import Restaurant from "../../models/restaurant.model.js";

// ✅ CREATE CATEGORY
export const createCategoryService = async (branchId, data) => {
  // Authorization is now handled by RBAC middleware
  
  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  const category = await MenuCategory.create({
    ...data,
    branch: branchId,
    brand: branch.brandId
  });

  return category;
};

// ✅ GET ALL CATEGORIES
export const getCategoriesService = async (branchId) => {
  // Authorization is now handled by RBAC middleware
  
  const categories = await MenuCategory.find({
    branch: branchId,
    isActive: true,
  }).sort({ order: 1 });

  return categories;
};

// ✅ UPDATE CATEGORY
export const updateCategoryService = async (categoryId, data) => {
  const category = await MenuCategory.findById(categoryId);
  if (!category) throw new Error("Category not found");

  Object.assign(category, data);
  await category.save();

  return category;
};

// ✅ DELETE CATEGORY (soft delete)
export const deleteCategoryService = async (categoryId) => {
  const category = await MenuCategory.findById(categoryId);
  if (!category) throw new Error("Category not found");

  // 1. Soft delete the category
  category.isActive = false;
  await category.save();

  // 2. Soft delete all items in this category
  await MenuItem.updateMany(
    { category: categoryId, isActive: true },
    { isActive: false }
  );

  return { message: "Category and linked menu items deleted successfully" };
};