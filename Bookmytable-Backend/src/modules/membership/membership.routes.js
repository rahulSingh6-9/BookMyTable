import express from "express";

import { getMyMemberships } from "./membership.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/my-memberships",
  protect,
  getMyMemberships
);

export default router;