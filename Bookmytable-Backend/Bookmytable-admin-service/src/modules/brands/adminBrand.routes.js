import express from "express";
import { 
    getAllBrands, 
    approveBrand, 
    suspendBrand,
    getBrandDetails 
} from "./adminBrand.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect); // All admin routes protected

router.get("/", requirePermission(PERMISSIONS.BRANDS_VIEW), getAllBrands);
router.get("/:id", requirePermission(PERMISSIONS.BRANDS_VIEW), getBrandDetails);
router.patch("/:id/approve", requirePermission(PERMISSIONS.RESTAURANTS_APPROVE), approveBrand);
router.patch("/:id/suspend", requirePermission(PERMISSIONS.RESTAURANTS_SUSPEND), suspendBrand);

export default router;
