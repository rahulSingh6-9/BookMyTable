import express from 'express';
import { createTable, deleteTable, getTables, updateTable } from './table.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:restaurantId', protect, getTables)
router.post('/:restaurantId', protect, createTable)
router.put('/:tableId', protect, updateTable)
router.delete('/:tableId', protect, deleteTable)

export default router;
