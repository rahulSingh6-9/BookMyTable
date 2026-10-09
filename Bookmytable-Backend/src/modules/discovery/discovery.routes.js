import express from "express";
import { 
  getHomepageSections, 
  searchRestaurants, 
  getCities, 
  getAreas, 
  getNearbyRestaurants,
  getRestaurantDetails, 
  getRestaurantMenu, 
  getRestaurantReservationLimits, 
  incrementRestaurantReservationCount 
} from "./discovery.controller.js";

const router = express.Router();

router.get("/homepage-sections", getHomepageSections);
router.get("/search", searchRestaurants);
router.get("/nearby", getNearbyRestaurants);
router.get("/cities", getCities);
router.get("/areas", getAreas);
router.get("/:id", getRestaurantDetails);
router.get("/:id/menu", getRestaurantMenu);
router.get("/:id/limits/reservations", getRestaurantReservationLimits);
router.post("/:id/limits/reservations/increment", incrementRestaurantReservationCount);

export default router;

