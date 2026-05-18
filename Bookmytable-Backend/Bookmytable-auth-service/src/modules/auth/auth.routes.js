import express from "express";
import {
  loginWeb,
  loginAdmin,
  signup,
  resetpassword,
  forgotpassword,
  verifyResetTokenController,
} from "./auth.controller.js";

import { loginSchema, signupSchema } from "./auth.validation.js";

import { validate } from "../../middleware/validate.middleware.js";

const router = express.Router();

// 🔐 AUTH ROUTES

// ✅ Separate login endpoints
router.post("/login/web", validate(loginSchema), loginWeb);
router.post("/login/admin", validate(loginSchema), loginAdmin);

// ✅ Keep signup same (web users only usually)
router.post("/signup", validate(signupSchema), signup);

// 🔁 Password routes
router.post("/forgot-password", forgotpassword);
router.post("/reset-password", resetpassword);
router.get("/verify-reset-token", verifyResetTokenController);

export default router;