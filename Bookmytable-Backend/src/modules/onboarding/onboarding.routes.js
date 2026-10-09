import express from 'express';
import { saveDraft, getDraft, deleteDraft, submitOnboarding, verifyRequestBusinessEmail, verifyConfirmBusinessEmail } from './onboarding.controller.js';
import { protect } from '../../middleware/auth.middleware.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.post('/draft', protect, saveDraft);
router.get('/draft', protect, getDraft);
router.delete('/draft', protect, deleteDraft);
router.post('/submit', protect, submitOnboarding);
router.post('/email/verify-request', protect, verifyRequestBusinessEmail);
router.post('/email/verify', verifyConfirmBusinessEmail);
router.post('/media', protect, upload.array('files', 6), async (req, res, next) => {
  try {
    const { uploadMediaService } = await import('./onboarding.services.js');
    const result = await uploadMediaService(req.files);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
