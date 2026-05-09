import express from "express";
import { getLogsController } from "./log.controller.js";

const router = express.Router();

// Restaurant-specific logs
router.get("/:restaurantId",  getLogsController);

export default router;