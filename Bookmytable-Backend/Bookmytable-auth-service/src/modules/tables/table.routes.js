import express from "express";
import {
  createTable,
  getTablesByRestaurant,
  deleteTable,
  updateTableStatus,
} from "./table.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/role.middleware.js";

const router = express.Router();

// 🔥 OWNER ROUTES
router.post("/", protect, authorize("owner"), createTable);

// 🔥 GET TABLES (public + owner)
router.get("/restaurant/:restaurantId", getTablesByRestaurant);

// 🔥 DELETE TABLE
router.delete("/:id", protect, authorize("owner"), deleteTable);

// 🔥 UPDATE TABLE STATUS (walk-in support)
router.patch(
  "/:id/status",
  protect,
  authorize("owner"),
  updateTableStatus
);

export default router;
