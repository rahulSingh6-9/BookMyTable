import express from "express";
import { create, getAll, getMyRestaurant } from "./restaurant.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRestaurantSchema } from "../../validation/restaurant.joi.js";
import { ROLES } from "../../config/roles.js";


const router = express.Router();

// PUBLIC — any visitor can browse restaurants
router.get("/", getAll);


// OWNER ONLY — 
router.get('/my', protect, getMyRestaurant)
// create a new restaurant
router.post("/", protect, authorize(ROLES.OWNER), validate(createRestaurantSchema), create);




export default router;