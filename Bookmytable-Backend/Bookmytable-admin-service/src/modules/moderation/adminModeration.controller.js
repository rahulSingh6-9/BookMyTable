import { getApprovalQueueService, getVerificationsService } from "./adminModeration.service.js";

// @desc    Get consolidated approval queue (brands + restaurants)
// @route   GET /api/admin/moderation/queue
// @access  Private (Admin - admins.manage / restaurants.manage / brands.manage)
export const getApprovalQueue = async (req, res, next) => {
    try {
        const queue = await getApprovalQueueService();
        res.status(200).json({ success: true, data: queue });
    } catch (error) {
        next(error);
    }
};

// @desc    Get consolidated verifications list
// @route   GET /api/admin/moderation/verifications
// @access  Private (Admin - users.manage)
export const getVerifications = async (req, res, next) => {
    try {
        const verifications = await getVerificationsService();
        res.status(200).json({ success: true, data: verifications });
    } catch (error) {
        next(error);
    }
};
