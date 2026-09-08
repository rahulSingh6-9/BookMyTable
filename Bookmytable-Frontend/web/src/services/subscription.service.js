import apiClient from "../lib/api.js";

/**
 * Subscription API Service
 * Handles fetching subscription plan details, usage, and features.
 */

/**
 * Get active subscription details for current context
 */
export const getMySubscription = async () => {
  try {
    const response = await apiClient.get('/restaurants/subscriptions/my-subscription');
    return response.data;
  } catch (error) {
    console.error("[SubscriptionService] Error fetching subscription:", error);
    throw error;
  }
};

/**
 * Get current resource usage compared against limits
 */
export const getMyUsage = async () => {
  try {
    const response = await apiClient.get('/restaurants/subscriptions/my-usage');
    return response.data;
  } catch (error) {
    console.error("[SubscriptionService] Error fetching usage:", error);
    throw error;
  }
};

/**
 * Get available boolean feature flags for current subscription
 */
export const getMyFeatures = async () => {
  try {
    const response = await apiClient.get('/restaurants/subscriptions/my-features');
    return response.data;
  } catch (error) {
    console.error("[SubscriptionService] Error fetching features:", error);
    throw error;
  }
};
