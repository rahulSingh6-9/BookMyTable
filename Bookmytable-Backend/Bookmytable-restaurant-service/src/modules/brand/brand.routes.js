import express from 'express';
import { getMyBrands, getArchivedBrands, updateBrandLogo, deactivateBrand, archiveBrand, restoreBrand } from './brand.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.js';

import {
  deactivateBranch,
  softDeleteBranch,
  restoreBranch,
  permanentDeleteBranch
} from '../restaurant/restaurant.controller.js';

const router = express.Router();

router.get('/my-brands', protect, getMyBrands);
router.get('/archived', protect, getArchivedBrands);
router.patch('/:id/logo', protect, upload.single('image'), updateBrandLogo);

// ──────────────────────────────────────────────
// Branch Lifecycle Management (Brand Context)
// ──────────────────────────────────────────────
router.patch('/:brandId/branches/:branchId/deactivate', protect, deactivateBranch);
router.delete('/:brandId/branches/:branchId', protect, softDeleteBranch);
router.patch('/:brandId/branches/:branchId/restore', protect, restoreBranch);
router.delete('/:brandId/branches/:branchId/permanent', protect, permanentDeleteBranch);

// ──────────────────────────────────────────────
// Brand Lifecycle Management
// ──────────────────────────────────────────────
router.patch('/:id/deactivate', protect, deactivateBrand);
router.patch('/:id/archive', protect, archiveBrand);
router.patch('/:id/restore', protect, restoreBrand);

export default router;
