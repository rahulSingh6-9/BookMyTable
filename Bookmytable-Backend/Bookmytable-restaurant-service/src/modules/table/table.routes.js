import express from 'express';
import { createTable, deleteTable, getTables, updateTable } from './table.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// 📋 List tables - Requires MANAGE_TABLES or similar
router.get('/:restaurantId', protect, authorize("MANAGE_TABLES"), getTables);

// ➕ Create table
router.post('/:restaurantId', protect, authorize("MANAGE_TABLES"), createTable);

// ✏️ Update table
// Note: For update/delete, we pass restaurantId via header or query if not in params, 
// OR the middleware can extract it from the table itself (not implemented yet).
// For now, we assume the client sends x-branch-id header.
router.put('/:tableId', protect, authorize("MANAGE_TABLES"), updateTable);

// 🗑️ Delete table
router.delete('/:tableId', protect, authorize("MANAGE_TABLES"), deleteTable);

export default router;
