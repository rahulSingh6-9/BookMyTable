import express from "express";
import { 
    getAllRestaurantsForAdmin,
    getAllBrandsForAdmin,
    getAllBranchesForAdmin,
    getAllMembershipsForAdmin 
} from "./admin.controller.js";

const router = express.Router();

// Internal use only (Admin Service ke liye)
router.get("/restaurants/export", getAllRestaurantsForAdmin);
router.get("/brands/export", getAllBrandsForAdmin);
router.get("/branches/export", getAllBranchesForAdmin);
router.get("/memberships/export", getAllMembershipsForAdmin);

export default router;