import MenuItem from "../../models/menuItem.model.js";
import MenuCategory from "../../models/menuCategory.model.js";
import Restaurant from "../../models/restaurant.model.js";


import cloudinary from "../../config/cloudinary.js";

export const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "bookmytable/menu-items" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    ).end(file.buffer);
  });
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};


// ✅ CREATE ITEM
export const createMenuItemService = async (restaurantId, userId, data, file) => {
  const { category } = data;

  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const uploadResult = await uploadImageToCloudinary(file);
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  // 🔥 1. Restaurant check
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  // 🔥 2. Category check
  const categoryDoc = await MenuCategory.findById(category);
  if (!categoryDoc) throw new Error("Category not found");

  // 🔥 CRITICAL CHECK
  if (categoryDoc.restaurant.toString() !== restaurantId) {
    throw new Error("Category does not belong to this restaurant");
  }

  // 🔥 3. Create item
  const item = await MenuItem.create({
    ...data,
    image: imageUrl,
    imagePublicId: imagePublicId,
    restaurant: restaurantId,
  });

  return item;
};

// ✅ GET ITEMS (by category or all)
export const getMenuItemsService = async (restaurantId, userId, categoryId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  const filter = {
    restaurant: restaurantId,
    isActive: true,
  };

  if (categoryId) {
    filter.category = categoryId;
  }

  const items = await MenuItem.find(filter)
    .sort({ order: 1 })
    .populate("category", "name");

  return items;
};

// ✅ UPDATE ITEM
export const updateMenuItemService = async (itemId, userId, data, file) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new Error("Item not found");

  const restaurant = await Restaurant.findById(item.restaurant);

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  let imageUrl = item.image;
  let imagePublicId = item.imagePublicId;

  if (file) {
    if (item.imagePublicId) {
      await deleteImageFromCloudinary(item.imagePublicId);
    }
    const uploadResult = await uploadImageToCloudinary(file);
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  Object.assign(item, data);
  item.image = imageUrl;
  item.imagePublicId = imagePublicId;
  await item.save();

  return item;
};

// ✅ DELETE ITEM (soft delete)
export const deleteMenuItemService = async (itemId, userId) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new Error("Item not found");

  const restaurant = await Restaurant.findById(item.restaurant);

  if (restaurant.owner.toString() !== userId) {
    const error = new Error("Unauthorized");
    error.status = 403;
    throw error;
  }

  if (item.imagePublicId) {
    await deleteImageFromCloudinary(item.imagePublicId);
    item.image = null;
    item.imagePublicId = null;
  }

  item.isActive = false;
  await item.save();

  return { message: "Item deleted" };
};