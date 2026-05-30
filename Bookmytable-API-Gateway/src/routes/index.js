import express from "express";
import createProxy from "../proxies/serviceProxy.js";
import { verifyToken, verifyAdmin, optionalVerifyToken } from "../middlewares/auth.middleware.js";

import dotenv from 'dotenv'
dotenv.config()

const router = express.Router();

const {
  AUTH_SERVICE_URL,
  USER_SERVICE_URL,
  RESTAURANT_SERVICE_URL,
  BOOKING_SERVICE_URL,
  ADMIN_SERVICE_URL,
  AI_SERVICE_URL,
} = process.env;


// Public routes
router.use("/auth", createProxy(AUTH_SERVICE_URL, { "^": "/auth" }));
router.use("/verification", createProxy(AUTH_SERVICE_URL, { "^": "/verification" }));
router.use("/restaurants/subscriptions/public/plans", createProxy(RESTAURANT_SERVICE_URL, { "^": "/subscriptions/public/plans" }));
router.use("/discovery", createProxy(RESTAURANT_SERVICE_URL, { "^": "/discovery" }));
router.use("/booking/public", createProxy(BOOKING_SERVICE_URL, { "^": "/booking/public" }));

router.use("/users", verifyToken, createProxy(USER_SERVICE_URL, { "^": "/users" }));

// Protected routes
router.use("/memberships", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/memberships" }))
router.use("/booking", verifyToken, createProxy(BOOKING_SERVICE_URL, { "^": "/booking" }));
router.use("/restaurants/subscriptions", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/subscriptions" }));
router.use("/restaurants", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/restaurants" }));
router.use("/brands", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/brands" }));
router.use("/tables", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/tables" }));



router.use("/menu-categories", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/menu-categories" }));
router.use("/menu-items", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/menu-items" }));
router.use("/availability", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/availability" }));
router.use("/onboarding", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/onboarding" }));
router.use("/business-workspace", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/business-workspace" }));
router.use("/logs", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/logs" }));

// 👤 Staff Accept Invite (Public)
router.get("/staff/invite/validate", createProxy(RESTAURANT_SERVICE_URL));
router.post("/staff/accept-invite", optionalVerifyToken, createProxy(RESTAURANT_SERVICE_URL));

// ✉️ Business Email Verification (Public)
router.post("/onboarding/email/verify", createProxy(RESTAURANT_SERVICE_URL, { "^": "/onboarding/email/verify" }));

// 🔐 Protected Staff Routes
router.use("/staff", verifyToken, createProxy(RESTAURANT_SERVICE_URL, { "^": "/staff" }) )

// 🔴 Admin routes
router.use("/admin", verifyToken, verifyAdmin, createProxy(ADMIN_SERVICE_URL, { "^": "/admin" }));

export default router;