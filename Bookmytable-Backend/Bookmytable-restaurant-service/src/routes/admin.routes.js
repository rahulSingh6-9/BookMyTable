import express from 'express'
import { protect } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/role.middleware.js";

import { 
    getAllRestaurants, 
    approveRestaurant, 
    suspendRestaurant 
} from '../controllers/admin.controller.js'

const router = express.Router()

// All admin routes: first populate req.user from gateway headers, then verify admin role
router.get("/restaurants", protect, verifyAdmin, getAllRestaurants)

router.patch("/restaurants/:id/approve", protect, verifyAdmin, approveRestaurant)
router.patch("/restaurants/:id/suspend", protect, verifyAdmin, suspendRestaurant)

export default router