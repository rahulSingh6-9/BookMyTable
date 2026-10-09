import { getActiveSubscription } from "../modules/subscriptions/subscription.service.js";
import Restaurant from "../models/restaurant.model.js";

/**
 * Middleware to enforce subscription feature limits.
 * Validates if the given feature is enabled in the brand's active subscription.
 *
 * @param {string} featureName - The feature key to check (e.g., 'analytics', 'qrOrdering')
 */
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const branchId =
        req.branchId ||
        req.headers["x-branch-id"] ||
        req.params.branchId ||
        req.params.restaurantId ||
        req.params.id ||
        req.query.branchId ||
        req.body?.branchId ||
        req.body?.restaurantId;

      let brandId = req.brandId;

      if (!brandId && branchId) {
        const branch = await Restaurant.findById(branchId).select("brandId");
        if (branch) {
          brandId = branch.brandId;
          req.brandId = brandId;
        }
      }

      if (!brandId) {
        return res.status(400).json({
          success: false,
          message: "Brand context missing. Cannot verify subscription features.",
        });
      }

      const subscription = await getActiveSubscription(brandId);
      
      const isFeatureEnabled = subscription?.subscriptionPlanId?.features?.[featureName] === true;

      if (!isFeatureEnabled) {
        return res.status(403).json({
          success: false,
          message: `SaaS Feature Blocked: The feature '${featureName}' is not enabled in your current plan. Please upgrade your subscription plan to unlock this.`,
          code: "SUBSCRIPTION_FEATURE_LOCKED"
        });
      }

      next();
    } catch (error) {
      console.error("[Subscription Feature Middleware Error]:", error);
      return res.status(500).json({
        success: false,
        message: "Internal subscription processing error",
        error: error.message,
      });
    }
  };
};
