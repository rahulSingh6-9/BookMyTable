import Restaurant from '../../models/restaurant.model.js';
import Brand from '../../models/brand.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Table from '../../models/table.model.js';
import RestaurantSettings from '../../models/restaurantSettings.model.js';
import { emitRestaurantCreated } from "../../kafka/index.js";
import { ROLES } from "../../config/roles.js";

/**
 * GET MY BRANCHES
 * Returns all branches where the user has an active membership.
 */
export const getMyRestaurantService = async (userId) => {
  if (!userId) {
    const error = new Error("User ID is required");
    error.status = 400;
    throw error;
  }

  // Find all active memberships for this user
  const memberships = await BranchMembership.find({ 
    user: userId, 
    status: "active" 
  }).populate("branch");

  if (!memberships || memberships.length === 0) {
    const error = new Error("No memberships found for this user");
    error.status = 404;
    throw error;
  }

  // Return formatted data
  return memberships.map(m => ({
    membershipId: m._id,
    role: m.role,
    branch: m.branch,
    joinedAt: m.joinedAt
  }));
};


/**
 * CREATE RESTAURANT (BRANCH)
 */
export const createRestaurant = async (data, user) => {
  const userId = user.id || user._id;
  const { branchName, onboardingMode, brandData } = data;
  let { brandId } = data;

  // 1. Handle Brand Selection / Creation
  if (onboardingMode === "create_brand") {
    const newBrand = await Brand.create({
      ...brandData,
      ownerId: userId,
      status: "approved", // Auto-approve for onboarding for now
    });
    brandId = newBrand._id;
  } else if (onboardingMode === "skip") {
    // Create a lightweight internal brand
    const internalBrandName = `${branchName} Brand`;
    const slug = internalBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const normalizedName = internalBrandName.toLowerCase().replace(/\s+/g, "");
    
    const internalBrand = await Brand.create({
      name: internalBrandName,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      normalizedName,
      ownerId: userId,
      status: "approved",
      description: "Automatically created brand for quick restaurant setup.",
    });
    brandId = internalBrand._id;
  }

  // 1b. Ensure brand subscription is allocated and check SaaS limits
  const { getOrCreateSubscription, checkLimit } = await import("../subscriptions/subscription.service.js");
  await getOrCreateSubscription(brandId, userId);

  const branchCount = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true }, isActive: true });
  try {
    await checkLimit(brandId, "maxBranches", branchCount);
  } catch (error) {
    if (error.code === "PLAN_LIMIT_EXCEEDED") {
      const { emitBranchCreationBlockedPlanLimit } = await import("../../kafka/index.js");
      // Use fallback limits logic locally to determine limitVal
      const limitVal = branchCount; // We can assume it's equal to branchCount if it failed, but let's just pass branchCount
      await emitBranchCreationBlockedPlanLimit(brandId, user.email, "unknown", branchCount);
    }
    throw error;
  }

  // 2. Prevent duplicate branchName per brand (basic check)
  const existing = await Restaurant.findOne({
    branchName,
    brandId,
    ownerId: userId,
  });

  if (existing) {
    throw new Error("A branch with this name already exists for your brand");
  }

  // 3. Create Restaurant Branch
  const restaurant = await Restaurant.create({
    ...data,
    brandId, // Ensure brandId is set
    ownerId: userId,
  });

  // 4. Create Tables if provided
  if (data.tables && Array.isArray(data.tables) && data.tables.length > 0) {
    const tableDocs = data.tables.map(t => ({
      branch: restaurant._id,
      brand: brandId,
      tableCode: t.tableCode,
      capacity: t.capacity,
      type: t.type || "indoor",
      status: "available",
      isActive: true
    }));
    await Table.insertMany(tableDocs);
  }

  // 5. Create Settings
  if (data.settings) {
    await RestaurantSettings.create({
      brand: brandId,
      branch: restaurant._id,
      ...data.settings
    });
  } else {
    // Create default settings if not provided
    await RestaurantSettings.create({
      brand: brandId,
      branch: restaurant._id
    });
  }

  // 6. CRITICAL: Create initial BranchMembership for the creator as 'owner'
  await BranchMembership.create({
    user: userId,
    branch: restaurant._id,
    brand: brandId,
    role: ROLES.OWNER,
    status: "active",
    joinedAt: new Date(),
    isPrimaryOwner: true
  });

  // Emit Event
  await emitRestaurantCreated(restaurant, userId);

  const { recalculateUsage } = await import("../subscriptions/subscription.service.js");
  recalculateUsage(brandId).catch(err => console.error("Recalculate usage err:", err));

  return restaurant;
};


/**
 * GET ALL RESTAURANTS (Public Discovery)
 */
export const getAllRestaurants = async (query) => {
  const { page = 1, limit = 10, city, cuisine } = query;

  const filter = { 
    isActive: true,
    status: "approved" // Only show approved restaurants to public
  };

  if (city) filter["address.city"] = city;
  if (cuisine) filter.cuisines = { $in: [cuisine] };

  const restaurants = await Restaurant.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ averageRating: -1, createdAt: -1 });

  return restaurants;
};
