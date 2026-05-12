import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";
import {
  getAllUsersController,
  banUser,
  unbanUser,
  updateUserRole,
} from "./adminUser.controller.js";

import { requirePermission } from "../../middleware/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.js";

const router = express.Router();

router.use(protect);

router.get("/", requirePermission(PERMISSIONS.USERS_VIEW), getAllUsersController);
router.patch("/:id/ban", requirePermission(PERMISSIONS.USERS_BLOCK), banUser);
router.patch("/:id/unban", requirePermission(PERMISSIONS.USERS_BLOCK), unbanUser);
router.patch("/:id/role", requirePermission(PERMISSIONS.USERS_EDIT), updateUserRole);

export default router;
