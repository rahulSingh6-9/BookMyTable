import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { verifyAdmin } from "../../middleware/role.middleware.js";
import {
  getAllUsersController,
  banUser,
  unbanUser,
  updateUserRole,
} from "./adminUser.controller.js";

const router = express.Router();

router.use(protect);
router.use(verifyAdmin);

router.get("/", getAllUsersController);
router.patch("/:id/ban", banUser);
router.patch("/:id/unban", unbanUser);
router.patch("/:id/role", updateUserRole);

export default router;
