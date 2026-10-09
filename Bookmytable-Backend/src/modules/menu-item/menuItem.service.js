import MenuItem from "../../models/menuItem.model.js";
import MenuCategory from "../../models/menuCategory.model.js";
import Restaurant from "../../models/restaurant.model.js";


import cloudinary from "../../config/cloudinary.js";

export const uploadImageToCloudinary = (file) => {
  if (!file?.buffer?.length) {
    return Promise.reject(new Error("Image file is missing or empty"));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "bookmytable/menu-items",
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};


// ✅ CREATE ITEM
export const createMenuItemService = async (branchId, data, file) => {
  const { category } = data;

  let imageUrl = null;
  let imagePublicId = null;

  if (file) {
    const uploadResult = await uploadImageToCloudinary(file);
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  // 🔥 1. Branch check
  const branch = await Restaurant.findById(branchId);
  if (!branch) throw new Error("Branch not found");

  // 🔥 2. Category check
  const categoryDoc = await MenuCategory.findById(category);
  if (!categoryDoc) throw new Error("Category not found");

  // 🔥 CRITICAL CHECK
  if (categoryDoc.branch.toString() !== branchId) {
    throw new Error("Category does not belong to this branch");
  }

  // 🔥 3. Create item
  const item = await MenuItem.create({
    ...data,
    image: imageUrl,
    imagePublicId: imagePublicId,
    branch: branchId,
    brand: branch.brandId
  });

  return item;
};

// ✅ GET ITEMS (by category or all)
export const getMenuItemsService = async (branchId, categoryId) => {
  const filter = {
    branch: branchId,
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
export const updateMenuItemService = async (itemId, data, file) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new Error("Item not found");

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
export const deleteMenuItemService = async (itemId) => {
  const item = await MenuItem.findById(itemId);
  if (!item) throw new Error("Item not found");

  if (item.imagePublicId) {
    await deleteImageFromCloudinary(item.imagePublicId);
    item.image = null;
    item.imagePublicId = null;
  }

  item.isActive = false;
  await item.save();

  return { message: "Item deleted" };
};