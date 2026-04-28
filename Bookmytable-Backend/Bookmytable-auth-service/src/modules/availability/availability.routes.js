import express from "express";
import { getAvailableTables } from "./availability.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

// public or protected (your choice)
router.get("/", protect, getAvailableTables);

export default router;