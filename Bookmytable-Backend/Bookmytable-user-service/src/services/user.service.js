import User from "../models/user.model.js";

export const getCurrentUserService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserService = async (userId, updateData) => {
  console.log("🔄 Updating user:", { userId, updateData }); //++++Testing
  
  // Clean up undefined fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined || updateData[key] === "") {
      delete updateData[key];
    }
  });

  console.log("📋 Clean update data:", updateData); //++++Testing

  const user = await User.findByIdAndUpdate(userId, { $set: updateData }, {
    returnDocument: 'after',
    runValidators: false,
  }).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  console.log("✅ User updated:", user); //++++Testing

  return user;
};

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error("Incorrect current password");
    error.status = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();

  return true;
};