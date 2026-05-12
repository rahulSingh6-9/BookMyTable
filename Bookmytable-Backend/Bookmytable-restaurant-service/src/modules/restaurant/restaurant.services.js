import Restaurant from '../../models/restaurant.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
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
export const createRestaurant = async (data, userId) => {
  const { branchName, brandId } = data;

  // 1. Prevent duplicate branchName per brand (basic check)
  const existing = await Restaurant.findOne({
    branchName,
    brandId,
    ownerId: userId,
  });

  if (existing) {
    throw new Error("A branch with this name already exists for your brand");
  }

  // 2. Create Restaurant Branch
  const restaurant = await Restaurant.create({
    ...data,
    ownerId: userId,
  });

  // 3. 🚀 CRITICAL: Create initial BranchMembership for the creator as 'owner'
  await BranchMembership.create({
    user: userId,
    branch: restaurant._id,
    brand: brandId,
    role: ROLES.OWNER,
    status: "active",
    joinedAt: new Date(),
    isPrimaryOwner: true
  });

  // 📡 Emit Event
  await emitRestaurantCreated(restaurant, userId);

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
