import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";
import {
  createInvitation,
  getInvitations,
  validateToken,
  acceptInvitation,
  revokeInvitation,
  resendInvitation,
  getRBACConfig,
} from "./adminInvitation.controller.js";

const router = express.Router();

// Public routes
router.get("/token/:token", validateToken);

// Partially protected (Requires any authenticated user session to accept)
router.post("/accept", protect, acceptInvitation);

// Protected Admin routes (Requires ADMINS_MANAGE permission)
router.use(protect);
router.use(requirePermission([PERMISSIONS.ADMINS_MANAGE]));

router.get("/config", getRBACConfig);
router.post("/", createInvitation);
router.get("/", getInvitations);
router.patch("/:id/revoke", revokeInvitation);
router.post("/:id/resend", resendInvitation);

export default router;
