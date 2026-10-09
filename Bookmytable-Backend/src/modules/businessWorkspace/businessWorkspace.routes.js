import express from "express";
import { getBranding, updateBranding, getVerification, confirmPhone } from "./businessWorkspace.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/authorize.js";

const router = express.Router();

router.get("/branding", protect, authorize("VIEW_BASIC_INFO"), getBranding);
router.put("/branding", protect, authorize("MANAGE_BRANCH"), updateBranding);
router.get("/verification", protect, authorize("VIEW_BASIC_INFO"), getVerification);
router.post("/verification/phone/confirm", protect, authorize("MANAGE_BRANCH"), confirmPhone);

export default router;
