import * as subscriptionService from "./subscription.service.js";

export const createPlan = async (req, res, next) => {
  try {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await subscriptionService.updatePlan(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Subscription plan updated successfully",
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans(req.query);
    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const plan = await subscriptionService.getPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Subscription plan not found" });
    }
    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const applyOverride = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const result = await subscriptionService.applyOverride(req.body, adminId);
    res.status(200).json({
      success: true,
      message: "Subscription override applied successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getActiveSub = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const sub = await subscriptionService.getActiveSubscription(brandId);
    res.status(200).json({
      success: true,
      data: sub,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getOrCreateSub = async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const userId = req.user.id;
    const sub = await subscriptionService.getOrCreateSubscription(brandId, userId);
    res.status(200).json({
      success: true,
      data: sub,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getPublicPlans = async (req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans({ isActive: true });
    
    const formattedPlans = plans.map(plan => {
      const isPopular = plan.slug === "growth" || plan.name.toLowerCase() === "growth" || plan.name.toLowerCase().includes("popular");
      
      let badge = "";
      if (plan.isTrialPlan) {
        badge = "Free Trial";
      } else if (isPopular) {
        badge = "Most Popular";
      }

      return {
        id: plan._id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description || "",
        pricing: {
          monthly: plan.pricing?.monthly || 0,
          yearly: plan.pricing?.yearly || 0,
        },
        limits: {
          maxBranches: plan.limits?.maxBranches || 1,
          maxTables: plan.limits?.maxTables || 10,
          maxStaff: plan.limits?.maxStaff || 3,
          reservationsPerMonth: plan.limits?.maxReservationsPerMonth || 100,
        },
        features: {
          analytics: !!plan.features?.analytics,
          qrOrdering: !!plan.features?.qrOrdering,
          loyaltyProgram: !!plan.features?.loyaltyProgram,
          customBranding: !!plan.features?.customBranding,
          multiBranchHQ: !!plan.features?.multiBranchSupport,
          prioritySupport: !!plan.features?.prioritySupport,
        },
        badge,
        isPopular,
        isTrialPlan: !!plan.isTrialPlan,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedPlans,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMySubscription = async (req, res, next) => {
  try {
    const { default: Brand } = await import("../../models/brand.model.js");
    const { default: BranchMembership } = await import("../../models/branchmemberships.model.js");
    const { BrandSubscription } = await import("../../models/brandSubscription.model.js");

    // 1. Resolve brand
    let brandId;
    let brand = await Brand.findOne({ ownerId: req.user.id, isDeleted: { $ne: true } });
    if (brand) {
      brandId = brand._id;
    } else {
      const membership = await BranchMembership.findOne({ user: req.user.id, status: "active" });
      if (membership) {
        brandId = membership.brand;
      }
    }

    if (!brandId) {
      return res.status(404).json({ success: false, message: "No brand associated with your account. Please complete onboarding first." });
    }

    // 2. Get active subscription
    let subscription = await subscriptionService.getActiveSubscription(brandId);
    if (!subscription) {
      // Auto-provision free trial if somehow missing
      subscription = await subscriptionService.getOrCreateSubscription(brandId, req.user.id);
      subscription = await BrandSubscription.findById(subscription._id).populate("subscriptionPlanId");
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyUsage = async (req, res, next) => {
  try {
    const { default: Brand } = await import("../../models/brand.model.js");
    const { default: BranchMembership } = await import("../../models/branchmemberships.model.js");
    const { SubscriptionUsage } = await import("../../models/subscriptionUsage.model.js");

    // 1. Resolve brand
    let brandId;
    let brand = await Brand.findOne({ ownerId: req.user.id, isDeleted: { $ne: true } });
    if (brand) {
      brandId = brand._id;
    } else {
      const membership = await BranchMembership.findOne({ user: req.user.id, status: "active" });
      if (membership) {
        brandId = membership.brand;
      }
    }

    if (!brandId) {
      return res.status(404).json({ success: false, message: "No brand associated with your account." });
    }

    // Recalculate usage dynamically to be 100% accurate!
    await subscriptionService.recalculateUsage(brandId);

    // Get current usage and populate plan limits
    const usage = await SubscriptionUsage.findOne({ brandId });
    const subscription = await subscriptionService.getActiveSubscription(brandId);

    // Default fallback limits for non-subscribed or expired
    const defaultLimits = {
      maxBranches: 1,
      maxTables: 10,
      maxStaff: 3,
      maxReservationsPerMonth: 50,
    };

    const limits = subscription?.subscriptionPlanId?.limits || defaultLimits;

    res.status(200).json({
      success: true,
      data: {
        usage,
        limits,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getMyFeatures = async (req, res, next) => {
  try {
    const { default: Brand } = await import("../../models/brand.model.js");
    const { default: BranchMembership } = await import("../../models/branchmemberships.model.js");

    // 1. Resolve brand
    let brandId;
    let brand = await Brand.findOne({ ownerId: req.user.id, isDeleted: { $ne: true } });
    if (brand) {
      brandId = brand._id;
    } else {
      const membership = await BranchMembership.findOne({ user: req.user.id, status: "active" });
      if (membership) {
        brandId = membership.brand;
      }
    }

    if (!brandId) {
      return res.status(404).json({ success: false, message: "No brand associated with your account." });
    }

    const subscription = await subscriptionService.getActiveSubscription(brandId);

    const defaultFeatures = {
      analytics: false,
      qrOrdering: false,
      loyaltyProgram: false,
      customBranding: false,
      multiBranchSupport: false,
      prioritySupport: false,
    };

    const features = subscription?.subscriptionPlanId?.features || defaultFeatures;

    res.status(200).json({
      success: true,
      data: features,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

