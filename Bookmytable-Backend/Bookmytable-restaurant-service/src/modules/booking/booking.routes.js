import express from "express";
import { createBooking } from "./booking.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createBooking);

export default router;
