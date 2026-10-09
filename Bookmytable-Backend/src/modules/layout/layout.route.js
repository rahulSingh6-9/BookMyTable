import express from "express";
import * as layoutController from "./layout.controller.js";
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// Dining Areas
router.get(
  "/branch/:branchId/dining-areas",
  protect, 
  authorize("MANAGE_TABLES"),
  layoutController.getDiningAreas
);

router.post(
  "/branch/:branchId/dining-areas",
  protect, 
  authorize("MANAGE_TABLES"),
  layoutController.createDiningArea
);

router.delete(
  "/dining-areas/:id",
  protect, 
  authorize("MANAGE_TABLES"),
  layoutController.deleteDiningArea
);

// Layout Projects
router.get(
  "/projects/:layoutId",
  protect, 
  authorize("MANAGE_TABLES"),
  layoutController.getLayoutProject
);

router.put(
  "/projects/:layoutId",
  protect, 
  authorize("MANAGE_TABLES"),
  layoutController.updateLayoutProject
);

export default router;
