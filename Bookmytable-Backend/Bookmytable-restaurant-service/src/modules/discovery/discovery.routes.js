import express from "express";
import { getHomepageSections, searchRestaurants, getCities, getAreas, getRestaurantDetails, getRestaurantMenu } from "./discovery.controller.js";

const router = express.Router();

router.get("/homepage-sections", getHomepageSections);
router.get("/search", searchRestaurants);
router.get("/cities", getCities);
router.get("/areas", getAreas);
router.get("/:id", getRestaurantDetails);
router.get("/:id/menu", getRestaurantMenu);

export default router;
