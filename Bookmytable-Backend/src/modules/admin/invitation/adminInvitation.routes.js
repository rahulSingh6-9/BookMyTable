import express from "express";
import { protect, requirePermission } from "../../../middleware/auth.middleware.js";
import { PERMISSIONS } from "../../../config/permissions.js";
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

// Public routes for accepting invitations
router.get("/token/:token", validateToken);
router.post("/accept", protect, acceptInvitation);

// Protected routes (Admin operations)
router.get("/rbac-config", protect, getRBACConfig);
router.post("/", protect, requirePermission(PERMISSIONS.USERS_INVITE), createInvitation);
router.get("/", protect, requirePermission(PERMISSIONS.USERS_VIEW), getInvitations);
router.post("/:id/revoke", protect, requirePermission(PERMISSIONS.USERS_BLOCK), revokeInvitation);
router.post("/:id/resend", protect, requirePermission(PERMISSIONS.USERS_INVITE), resendInvitation);

export default router;
