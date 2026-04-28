import express from "express";
import createProxy from "../proxies/serviceProxy.js";
import { verifyToken, verifyAdmin } from "../middlewares/auth.middleware.js";

import dotenv from 'dotenv'
dotenv.config()

const router = express.Router();

const {
  AUTH_SERVICE_URL,
  USER_SERVICE_URL,
  BOOKING_SERVICE_URL,
  RESTAURANT_SERVICE_URL
} = process.env;

// Public routes
router.use("/auth", createProxy(AUTH_SERVICE_URL, { "^/": "/auth/" }));

router.use("/users", verifyToken, createProxy(USER_SERVICE_URL, { "^/": "/users/" }));


// Protected routes
router.use("/booking", verifyToken, createProxy(BOOKING_SERVICE_URL));
router.use("/restaurant", verifyToken, createProxy(RESTAURANT_SERVICE_URL));


// 🔴 Admin routes
// NOTE: pathRewrite replaces the leading "/" with the target prefix + "/".
// Express strips the mount path so proxy sees: "/" for base, "/123/approve" for sub-routes.
// "^/" → "/admin/users/"  =>  "/123/block"  becomes  "/admin/users/123/block"  ✅
router.use("/admin/users", verifyToken, verifyAdmin,
  createProxy(USER_SERVICE_URL, { "^/": "/admin/users/" })
);

// "^/" → "/admin/restaurants/"  =>  "/123/approve"  becomes  "/admin/restaurants/123/approve"  ✅
router.use("/admin/restaurants", verifyToken, verifyAdmin,
  createProxy(RESTAURANT_SERVICE_URL, { "^/": "/admin/restaurants/" })
);

export default router;