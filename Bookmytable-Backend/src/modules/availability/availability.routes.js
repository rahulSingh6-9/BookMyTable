import express from "express";
import { getAvailability } from "./availability.controller.js";

const router = express.Router();

router.get("/:branchSlug", getAvailability);

export default router;
