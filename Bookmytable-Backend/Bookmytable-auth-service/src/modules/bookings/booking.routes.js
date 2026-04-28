import express from "express";
import { createBookingController } from "./booking.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createBookingController);

export default router;