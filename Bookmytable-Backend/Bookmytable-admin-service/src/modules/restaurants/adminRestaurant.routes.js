import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";

import {
  getAllRestaurants,
  approveRestaurant,
  suspendRestaurant,
  rejectRestaurant,
} from "./adminRestaurant.controller.js";

const router = express.Router();

router.use(protect);
router.use(verifyAdmin);

router.get("/", getAllRestaurants);
router.patch("/:id/approve", approveRestaurant);
router.patch("/:id/suspend", suspendRestaurant);
router.patch("/:id/reject", rejectRestaurant);


export default router;