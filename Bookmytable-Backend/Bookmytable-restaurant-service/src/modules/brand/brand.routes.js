import express from 'express';
import { getMyBrands, updateBrandLogo } from './brand.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.get('/my-brands', protect, getMyBrands);
router.patch('/:id/logo', protect, upload.single('image'), updateBrandLogo);

export default router;
