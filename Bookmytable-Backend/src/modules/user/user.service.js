import mongoose from "mongoose";
import crypto from "crypto";
import User from "../../models/user.model.js";
import Favorite from "../../models/favorite.model.js";
import Restaurant from "../../models/restaurant.model.js";
import DiscoveryRestaurant from "../../models/discovery.model.js";
import Brand from "../../models/brand.model.js";
import Booking from "../../models/booking.model.js";
import { notificationService } from "../notification/notification.service.js";

/**
 * =========================================================
 * PROFILE DATA FORMATTING & DYNAMIC COMPUTATION
 * =========================================================
 */
const formatUserProfile = (user, totalBookings) => {
  const userObj = user.toObject ? user.toObject() : user;

  const basePoints = userObj.loyalty?.rewardPoints || 0;
  const points = basePoints + totalBookings * 500;

  let tier = "Bronze";
  if (points >= 5000) {
    tier = "Platinum";
  } else if (points >= 2500) {
    tier = "Gold";
  } else if (points >= 1000) {
    tier = "Silver";
  }

  const calculatedLoyalty = {
    tier,
    rewardPoints: points,
    totalBookings,
    nextTierPoints: tier === "Platinum" ? 0 : tier === "Gold" ? 5000 : tier === "Silver" ? 2500 : 1000,
  };

  return {
    ...userObj,
    loyalty: calculatedLoyalty,
  };
};

/**
 * =========================================================
 * GET FULL PROFILE
 * =========================================================
 */
export const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  let totalBookings = 0;
  try {
    totalBookings = await Booking.countDocuments({
      $or: [{ userId: String(userId) }, { user: new mongoose.Types.ObjectId(userId) }],
    });
  } catch (err) {
    console.error("⚠️ Failed to count bookings:", err.message);
  }

  return formatUserProfile(user, totalBookings);
};

/**
 * =========================================================
 * UPDATE PROFILE
 * =========================================================
 */
export const updateUserProfileService = async (userId, updateData) => {
  delete updateData.password;
  delete updateData.roles;
  delete updateData.email;
  delete updateData.phone;
  delete updateData._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    {
      new: true,
      runValidators: false,
    }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  let totalBookings = 0;
  try {
    totalBookings = await Booking.countDocuments({
      $or: [{ userId: String(userId) }, { user: new mongoose.Types.ObjectId(userId) }],
    });
  } catch (err) {
    console.error("⚠️ Failed to count bookings:", err.message);
  }

  return formatUserProfile(user, totalBookings);
};

/**
 * =========================================================
 * CHANGE PASSWORD
 * =========================================================
 */
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

/**
 * =========================================================
 * REQUEST PHONE CHANGE
 * =========================================================
 */
export const requestPhoneChangeService = async (userId, newPhone) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  let number = "";
  let e164 = "";
  let countryCode = "+91";

  if (typeof newPhone === "object") {
    number = newPhone.number || "";
    e164 = newPhone.e164 || newPhone.number || "";
    countryCode = newPhone.countryCode || "+91";
  } else {
    number = newPhone;
    e164 = newPhone.startsWith("+") ? newPhone : `+91${newPhone}`;
    countryCode = newPhone.startsWith("+") ? newPhone.substring(0, 3) : "+91";
  }

  if (!number) {
    const error = new Error("Invalid phone number format");
    error.status = 400;
    throw error;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    $set: {
      "pendingPhoneChange.phone": { number, e164, countryCode },
      "pendingPhoneChange.otpId": otp,
      "pendingPhoneChange.expiresAt": expiresAt,
    },
  });

  notificationService
    .sendPhoneOTP({ phone: e164, otp, purpose: "Change Contact Phone" })
    .catch((err) => console.error("⚠️ Failed to dispatch phone OTP:", err.message));

  return {
    success: true,
    message: "A verification OTP has been dispatched to your phone number",
    expiresAt,
  };
};

/**
 * =========================================================
 * VERIFY PHONE OTP & COMMIT CHANGE ATOMICALLY
 * =========================================================
 */
export const verifyPhoneOtpService = async (userId, otp) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const draft = user.pendingPhoneChange;
  if (!draft || !draft.otpId) {
    const error = new Error("No pending phone verification request found");
    error.status = 400;
    throw error;
  }

  if (new Date() > draft.expiresAt) {
    const error = new Error("Verification OTP code has expired. Please request a new one.");
    error.status = 400;
    throw error;
  }

  if (String(otp).trim() !== String(draft.otpId).trim()) {
    const error = new Error("Incorrect OTP code. Please try again.");
    error.status = 400;
    throw error;
  }

  user.phone = {
    number: draft.phone.number,
    e164: draft.phone.e164,
    countryCode: draft.phone.countryCode,
    isVerified: true,
  };

  if (!user.verification) user.verification = {};
  user.verification.phoneVerified = true;
  user.phoneVerified = true;
  user.pendingPhoneChange = undefined;
  await user.save();

  let totalBookings = 0;
  try {
    totalBookings = await Booking.countDocuments({
      $or: [{ userId: String(userId) }, { user: new mongoose.Types.ObjectId(userId) }],
    });
  } catch (err) {
    console.error("⚠️ Failed to count bookings:", err.message);
  }

  return formatUserProfile(user, totalBookings);
};

/**
 * =========================================================
 * RESEND PHONE OTP
 * =========================================================
 */
export const resendPhoneOtpService = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.pendingPhoneChange || !user.pendingPhoneChange.phone) {
    const error = new Error("No pending phone change request active");
    error.status = 400;
    throw error;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.pendingPhoneChange.otpId = otp;
  user.pendingPhoneChange.expiresAt = expiresAt;
  await user.save();

  notificationService
    .sendPhoneOTP({ phone: user.pendingPhoneChange.phone.e164, otp, purpose: "Resend Phone Verification" })
    .catch((err) => console.error("⚠️ Failed to dispatch phone OTP:", err.message));

  return {
    success: true,
    message: "A new OTP code has been resent to your phone number",
    expiresAt,
  };
};

/**
 * =========================================================
 * REQUEST EMAIL CHANGE
 * =========================================================
 */
export const requestEmailChangeService = async (userId, newEmail) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (!newEmail || !newEmail.includes("@")) {
    const error = new Error("Invalid email address format");
    error.status = 400;
    throw error;
  }

  const token = crypto.randomUUID().substring(0, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await User.findByIdAndUpdate(userId, {
    $set: {
      "pendingEmailChange.email": newEmail.toLowerCase().trim(),
      "pendingEmailChange.tokenId": token,
      "pendingEmailChange.expiresAt": expiresAt,
    },
  });

  notificationService
    .sendEmailVerification({ email: newEmail, token, userId: userId.toString() })
    .catch((err) => console.error("⚠️ Failed to dispatch email verification:", err.message));

  return {
    success: true,
    message: "A verification code has been dispatched to your new email address",
    expiresAt,
  };
};

/**
 * =========================================================
 * VERIFY EMAIL TOKEN & COMMIT CHANGE ATOMICALLY
 * =========================================================
 */
export const verifyEmailTokenService = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const draft = user.pendingEmailChange;
  if (!draft || !draft.tokenId) {
    const error = new Error("No pending email verification request found");
    error.status = 400;
    throw error;
  }

  if (new Date() > draft.expiresAt) {
    const error = new Error("Verification link/token has expired. Please request a new email change.");
    error.status = 400;
    throw error;
  }

  if (token.toUpperCase().trim() !== draft.tokenId.toUpperCase()) {
    const error = new Error("Incorrect verification token");
    error.status = 400;
    throw error;
  }

  user.email = draft.email;
  user.emailVerified = true;
  if (!user.verification) user.verification = {};
  user.verification.emailVerified = true;
  user.pendingEmailChange = undefined;
  await user.save();

  let totalBookings = 0;
  try {
    totalBookings = await Booking.countDocuments({
      $or: [{ userId: String(userId) }, { user: new mongoose.Types.ObjectId(userId) }],
    });
  } catch (err) {
    console.error("⚠️ Failed to count bookings:", err.message);
  }

  return formatUserProfile(user, totalBookings);
};

/**
 * =========================================================
 * DEACTIVATE ACCOUNT (SOFT DELETE)
 * =========================================================
 */
export const deactivateAccountService = async (userId, confirmPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(confirmPassword);
  if (!isMatch) {
    const error = new Error("Incorrect password confirmation. Account deactivation cancelled.");
    error.status = 400;
    throw error;
  }

  user.accountStatus = "deleted";
  user.isBlocked = true;
  user.deletedAt = new Date();
  await user.save();

  return {
    success: true,
    message: "Your BookMyTable account has been deactivated successfully. You may recover it in the future.",
  };
};

/**
 * =========================================================
 * ADD FAVORITE RESTAURANT
 * =========================================================
 */
export const addFavoriteService = async (userId, restaurantId) => {
  if (!restaurantId) {
    const error = new Error("Restaurant ID is required");
    error.status = 400;
    throw error;
  }

  let branch = null;
  let discovery = null;

  if (mongoose.Types.ObjectId.isValid(restaurantId)) {
    branch = await Restaurant.findById(restaurantId);
    if (!branch) {
      discovery = await DiscoveryRestaurant.findById(restaurantId);
      if (discovery?.restaurantId) {
        branch = await Restaurant.findById(discovery.restaurantId);
      }
    } else {
      discovery = await DiscoveryRestaurant.findOne({ restaurantId: branch._id });
    }
  }

  if (!branch) {
    branch = await Restaurant.findOne({ slug: restaurantId });
    if (!branch) {
      discovery = await DiscoveryRestaurant.findOne({ slug: restaurantId });
      if (discovery?.restaurantId) {
        branch = await Restaurant.findById(discovery.restaurantId);
      }
    }
  }

  if (!branch && !discovery) {
    const error = new Error("Restaurant not found");
    error.status = 404;
    throw error;
  }

  const canonicalId = branch ? String(branch._id) : String(discovery.restaurantId || discovery._id);
  const candidateIds = [String(restaurantId), canonicalId];
  if (discovery) {
    candidateIds.push(String(discovery._id));
    if (discovery.restaurantId) candidateIds.push(String(discovery.restaurantId));
  }
  if (branch) {
    candidateIds.push(String(branch._id));
  }

  const existingFavorite = await Favorite.findOne({
    user: userId,
    restaurantId: { $in: candidateIds },
  });

  if (existingFavorite) {
    const error = new Error("Restaurant is already in your favorites");
    error.status = 400;
    throw error;
  }

  await Favorite.create({ user: userId, restaurantId: canonicalId });
  return { success: true, restaurantId: canonicalId };
};

/**
 * =========================================================
 * REMOVE FAVORITE RESTAURANT
 * =========================================================
 */
export const removeFavoriteService = async (userId, restaurantId) => {
  if (!restaurantId) {
    const error = new Error("Restaurant ID is required");
    error.status = 400;
    throw error;
  }

  const candidateIds = [String(restaurantId)];

  if (mongoose.Types.ObjectId.isValid(restaurantId)) {
    const discovery = await DiscoveryRestaurant.findById(restaurantId);
    if (discovery?.restaurantId) {
      candidateIds.push(String(discovery.restaurantId));
    }
    const discFromBranch = await DiscoveryRestaurant.findOne({ restaurantId });
    if (discFromBranch) {
      candidateIds.push(String(discFromBranch._id));
    }
    const branch = await Restaurant.findById(restaurantId);
    if (branch) {
      candidateIds.push(String(branch._id));
    }
  } else {
    const discovery = await DiscoveryRestaurant.findOne({ slug: restaurantId });
    if (discovery) {
      candidateIds.push(String(discovery._id));
      if (discovery.restaurantId) candidateIds.push(String(discovery.restaurantId));
    }
    const branch = await Restaurant.findOne({ slug: restaurantId });
    if (branch) {
      candidateIds.push(String(branch._id));
    }
  }

  const deleted = await Favorite.findOneAndDelete({
    user: userId,
    restaurantId: { $in: candidateIds },
  });

  if (!deleted) {
    const error = new Error("Favorite restaurant not found");
    error.status = 404;
    throw error;
  }

  return { success: true };
};

/**
 * =========================================================
 * GET ALL FAVORITE RESTAURANTS FOR USER
 * =========================================================
 */
export const getFavoritesService = async (userId) => {
  const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 });
  if (!favorites.length) return [];

  const rawIds = favorites.map((f) => f.restaurantId);
  const validObjectIds = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const branches = await Restaurant.find({
    $or: [
      { _id: { $in: validObjectIds } },
      { slug: { $in: rawIds } },
    ],
  })
    .populate("brandId", "name logo")
    .lean();

  const branchIds = branches.map((b) => b._id);
  const discoveryDocs = await DiscoveryRestaurant.find({
    $or: [
      { restaurantId: { $in: [...validObjectIds, ...branchIds] } },
      { _id: { $in: validObjectIds } },
      { slug: { $in: rawIds } },
    ],
  }).lean();

  const discoveryByBranchId = new Map();
  const discoveryById = new Map();
  discoveryDocs.forEach((d) => {
    if (d.restaurantId) discoveryByBranchId.set(String(d.restaurantId), d);
    discoveryById.set(String(d._id), d);
  });

  const results = [];
  for (const fav of favorites) {
    const fId = String(fav.restaurantId);
    const branch = branches.find(
      (b) => String(b._id) === fId || b.slug === fId
    );
    const disc =
      discoveryById.get(fId) ||
      (branch ? discoveryByBranchId.get(String(branch._id)) : null);

    if (branch || disc) {
      const canonicalId = branch ? String(branch._id) : String(disc.restaurantId || disc._id);
      const discId = disc ? String(disc._id) : canonicalId;
      results.push({
        _id: canonicalId,
        id: canonicalId,
        restaurantId: canonicalId,
        discoveryId: discId,
        name: branch?.branchName || disc?.name || "Restaurant",
        branchName: branch?.branchName || disc?.name,
        slug: branch?.slug || disc?.slug,
        coverImage: branch?.coverImage || disc?.coverImage,
        cuisines: branch?.cuisines || disc?.cuisines || [],
        averageRating: branch?.averageRating ?? disc?.averageRating ?? 0,
        totalReviews: branch?.totalReviews ?? disc?.totalReviews ?? 0,
        costForTwo: branch?.costForTwo || disc?.costForTwo,
        city: branch?.address?.city || disc?.city,
        area: branch?.address?.area || disc?.area,
        address: branch?.address?.addressLine1 || disc?.addressLine1 || branch?.address?.city,
        location: branch?.location || disc?.location,
      });
    }
  }

  return results;
};

/**
 * =========================================================
 * ADMIN USER MANAGEMENT (Direct Internal Calls)
 * =========================================================
 */
export const banUserService = async (userId, admin) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: true, accountStatus: "blocked" },
    { new: true }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return { success: true, user, message: "User blocked successfully" };
};

export const unbanUserService = async (userId, admin) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBlocked: false, accountStatus: "active" },
    { new: true }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return { success: true, user, message: "User unblocked successfully" };
};

export const updateUserRoleService = async (userId, role, admin) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { roles: [role] },
    { new: true }
  ).select("-password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
  return { success: true, user, message: "User role updated successfully" };
};

export const getCurrentUserService = getUserProfileService;
export const updateUserService = updateUserProfileService;
