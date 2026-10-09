import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";
import * as pricingController from "./pricing.controller.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get(
  "/:branchId",
  authorize("MANAGE_TABLES"),
  pricingController.getPricingConfig
);

router.post(
  "/:branchId",
  authorize("MANAGE_TABLES"),
  pricingController.updatePricingConfig
);

router.post(
  "/auth/validate-password",
  authorize("MANAGE_TABLES"),
  pricingController.validatePassword
);

router.delete(
  "/:branchId/:pricingId",
  authorize("MANAGE_TABLES"),
  pricingController.deletePricingConfig
);

export default router;
