import express from 'express'
import { createLayout, getLayout, updateLayout } from "./layout.controller.js"
import { protect } from '../../middleware/auth.middleware.js'
import { authorize } from '../../middleware/role.middleware.js'

const router = express.Router()

// Public
router.get('/:restaurantId', getLayout)

// Owner
router.post('/', protect, authorize("owner"), createLayout)

// Owner
router.put('/:restaurantId', protect, authorize("owner"), updateLayout)

export default router