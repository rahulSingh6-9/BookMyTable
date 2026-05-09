import express from 'express'
import { getAllUsersForAdmin } from './admin.controller.js'; 
import { protect } from '../../middleware/auth.middleware.js'; 
import { internalAuth } from "../../middleware/internalAuth.middleware.js";

const router = express.Router()

// routes/internal.routes.js
router.get("/users/export", internalAuth, getAllUsersForAdmin);

export default router