import express from "express";
import {
  createLock,
  releaseLock,
  getLocksByRestaurant,
} from "./tableLock.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createLock);
router.delete("/table/:tableId", protect, releaseLock);
router.get("/:restaurantId", getLocksByRestaurant);

export default router;