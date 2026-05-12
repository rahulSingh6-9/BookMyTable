import { createRestaurant, getAllRestaurants, getMyRestaurantService } from "./restaurant.services.js";
import { createLog } from "../log/log.service.js";
import { ROLES } from "../../config/roles.js";

export const create = async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurant = await createRestaurant(req.body, userId);

    // 📝 Log Action
    createLog({
      action: "RESTAURANT_CREATED",
      performedBy: userId,
      role: ROLES.OWNER, // Initial role
      restaurant: restaurant._id,
      metadata: { branchName: restaurant.branchName, branchCode: restaurant.branchCode },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant branch created successfully",
      data: restaurant,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const restaurants = await getAllRestaurants(req.query);
    res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user.id;
    const myBranches = await getMyRestaurantService(userId);

    res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      data: myBranches,
    });
  } catch (err) {
    res.status(err.status || 400).json({
      success: false,
      message: err.message,
    });
  }
};
