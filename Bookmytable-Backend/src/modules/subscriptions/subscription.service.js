import mongoose from "mongoose";
import { SubscriptionPlan } from "../../models/subscriptionPlan.model.js";
import { BrandSubscription } from "../../models/brandSubscription.model.js";
import { SubscriptionUsage } from "../../models/subscriptionUsage.model.js";
import { BillingHistory } from "../../models/billingHistory.model.js";
import Restaurant from "../../models/restaurant.model.js";
import Table from "../../models/table.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import { createLog } from "../log/log.service.js";

/**
 * Get active subscription for a Brand
 */
export const getActiveSubscription = async (brandId) => {
  const activeSub = await BrandSubscription.findOne({
    brandId,
    status: { $in: ["active", "trial"] },
    expiresAt: { $gt: new Date() },
  }).populate("subscriptionPlanId");

  return activeSub;
};

/**
 * Get or automatically create a Free Trial subscription for a brand if one doesn't exist.
 */
export const getOrCreateSubscription = async (brandId, userId) => {
  if (!brandId) return null;

  let sub = await BrandSubscription.findOne({ brandId }).populate("subscriptionPlanId");
  
  if (!sub) {
    // Check if free trial plan exists or seed it
    let plan = await SubscriptionPlan.findOne({ isTrialPlan: true });
    if (!plan) {
      plan = await SubscriptionPlan.create({
        name: "Free Trial",
        slug: "free-trial",
        description: "30-day Free Trial plan for new restaurant brands.",
        pricing: { monthly: 0, yearly: 0 },
        limits: {
          maxBranches: 1,
          maxTables: 15,
          maxStaff: 5,
          maxReservationsPerMonth: 100,
        },
        features: {
          analytics: true,
          qrOrdering: false,
          loyaltyProgram: false,
          customBranding: false,
          multiBranchSupport: false,
          prioritySupport: false,
        },
        isTrialPlan: true,
        trialDays: 30,
        isActive: true,
      });
    }

    // Allocate trial subscription
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
    
    sub = await BrandSubscription.create({
      brandId,
      subscriptionPlanId: plan._id,
      status: "trial",
      billingCycle: "monthly",
      startedAt,
      expiresAt,
      trialEndsAt: expiresAt,
      autoRenew: false,
      createdBy: userId || new mongoose.Types.ObjectId(),
    });

    // Also initialize usage record
    await SubscriptionUsage.create({
      brandId,
      branchesUsed: 0,
      tablesUsed: 0,
      staffUsed: 0,
      reservationsThisMonth: 0,
      lastCalculatedAt: new Date(),
    });

    // Insert Brand Log
    await createLog({
      entityType: "brand",
      brandId: brandId,
      entityId: sub._id,
      action: "SUBSCRIPTION_CREATED",
      performedBy: userId || new mongoose.Types.ObjectId(),
      metadata: { planName: plan.name, status: "trial" }
    });

    // Seed initial free invoice
    await BillingHistory.create({
      brandId,
      subscriptionId: sub._id,
      amount: 0,
      currency: "INR",
      paymentStatus: "paid",
      paymentProvider: "system",
      transactionId: "TRIAL-" + Date.now().toString(),
      invoiceUrl: "#",
      paidAt: startedAt,
    });
  }

  return sub;
};

/**
 * PLAN MANAGEMENT
 */
export const createPlan = async (data) => {
  const { name, limits, features, pricing, description, isTrialPlan, trialDays } = data;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const existingPlan = await SubscriptionPlan.findOne({ slug });
  if (existingPlan) {
    throw new Error(`Plan with slug '${slug}' already exists`);
  }

  const plan = await SubscriptionPlan.create({
    name,
    slug,
    description,
    pricing,
    limits,
    features,
    isTrialPlan,
    trialDays,
    isActive: true,
  });

  return plan;
};

export const updatePlan = async (planId, data) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    planId,
    { $set: { ...data, updatedAt: new Date() } },
    { new: true }
  );

  if (!plan) {
    throw new Error("Subscription plan not found");
  }

  return plan;
};

export const getPlans = async (query = {}) => {
  return SubscriptionPlan.find(query);
};

export const getPlanById = async (id) => {
  return SubscriptionPlan.findById(id);
};

export const archivePlan = async (id) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    id,
    { $set: { isActive: false, updatedAt: new Date() } },
    { new: true }
  );
  if (!plan) throw new Error("Subscription plan not found");
  return plan;
};

export const restorePlan = async (id) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(
    id,
    { $set: { isActive: true, updatedAt: new Date() } },
    { new: true }
  );
  if (!plan) throw new Error("Subscription plan not found");
  return plan;
};

/**
 * SUBSCRIPTION OVERRIDES
 */
export const applyOverride = async (data, adminId) => {
  const { brandId, overrideType, reason, details } = data;

  let subscription = await BrandSubscription.findOne({ brandId }).populate("subscriptionPlanId");
  if (!subscription) {
    subscription = await getOrCreateSubscription(brandId, adminId);
  }

  const originalExpiresAt = subscription.expiresAt;
  const originalPlanId = subscription.subscriptionPlanId?._id || subscription.subscriptionPlanId;
  const originalStatus = subscription.status;

  const updateFields = { updatedAt: new Date() };

  if (overrideType === "trial_extension") {
    const days = parseInt(details.extendDays, 10);
    if (isNaN(days)) throw new Error("Invalid extendDays parameter");
    
    const baseDate = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
    updateFields.expiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    updateFields.trialEndsAt = updateFields.expiresAt;
    updateFields.status = "trial";
  } 
  else if (overrideType === "temporary_upgrade") {
    const targetPlanId = details.planId;
    const durationDays = parseInt(details.durationDays, 10) || 30;
    
    const targetPlan = await SubscriptionPlan.findById(targetPlanId);
    if (!targetPlan) throw new Error("Target upgrade plan not found");

    updateFields.subscriptionPlanId = targetPlan._id;
    updateFields.expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    updateFields.status = "active";
  } 
  else if (overrideType === "downgrade") {
    const targetPlanId = details.planId;
    const targetPlan = await SubscriptionPlan.findById(targetPlanId);
    if (!targetPlan) throw new Error("Target plan not found");

    updateFields.subscriptionPlanId = targetPlan._id;
    updateFields.status = "active";
  } 
  else if (overrideType === "reactivate") {
    const extendDays = parseInt(details.extendDays, 10) || 30;
    updateFields.status = "active";
    updateFields.expiresAt = new Date(Date.now() + extendDays * 24 * 60 * 60 * 1000);
  } 
  else if (overrideType === "suspend") {
    updateFields.status = "suspended";
  } 
  else if (overrideType === "grace_period") {
    const graceDays = parseInt(details.graceDays, 10) || 7;
    const baseDate = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
    updateFields.expiresAt = new Date(baseDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
    updateFields.status = "active";
  } 
  else if (overrideType === "bonus_features") {
    // Custom bonus override
  } 
  else {
    throw new Error("Invalid overrideType: " + overrideType);
  }

  // Save updated subscription
  const updatedSub = await BrandSubscription.findByIdAndUpdate(
    subscription._id,
    { $set: updateFields },
    { new: true }
  ).populate("subscriptionPlanId");

  // Create billing record if upgrade or reactivate
  if (overrideType === "reactivate" || overrideType === "temporary_upgrade") {
    await BillingHistory.create({
      brandId,
      subscriptionId: subscription._id,
      amount: details.amountCharge || 0,
      currency: "INR",
      paymentStatus: "paid",
      paymentProvider: "manual_override",
      transactionId: `OVERRIDE-${overrideType.toUpperCase()}-${Date.now()}`,
      invoiceUrl: "#",
      paidAt: new Date(),
    });
  }

  const overrideEvent = {
    _id: new mongoose.Types.ObjectId(),
    brandId,
    subscriptionId: subscription._id,
    overrideType,
    reason,
    details: {
      ...details,
      originalExpiresAt,
      originalPlanId,
      originalStatus,
    },
    appliedBy: adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Insert Brand Log
  await createLog({
    entityType: "brand",
    brandId: brandId,
    entityId: subscription._id,
    action: "SUBSCRIPTION_UPDATED",
    performedBy: adminId,
    metadata: { overrideType, reason, status: updateFields.status }
  });

  return { subscription: updatedSub, override: overrideEvent };
};

/**
 * SAAS LIMIT VALIDATIONS
 */
export const checkLimit = async (brandId, limitType, currentCount, requestedAmount = 1) => {
  const subscription = await getActiveSubscription(brandId);
  
  // Default fallback limits for non-subscribed or expired
  const defaultLimits = {
    maxBranches: 1,
    maxTables: 10,
    maxStaff: 3,
    maxReservationsPerMonth: 50,
  };

  const limitVal = subscription?.subscriptionPlanId?.limits?.[limitType] ?? defaultLimits[limitType];
  
  if (currentCount + requestedAmount > limitVal) {
    const error = new Error(
      `SaaS Limit Exceeded: Your plan allows a maximum of ${limitVal} ${limitType.replace("max", "")}. Please upgrade your subscription plan.`
    );
    error.code = "PLAN_LIMIT_EXCEEDED";
    error.status = 403;
    throw error;
  }
  return limitVal;
};

/**
 * SAAS FEATURE VALIDATIONS
 */
export const checkFeature = async (brandId, featureName) => {
  const subscription = await getActiveSubscription(brandId);
  const featureEnabled = subscription?.subscriptionPlanId?.features?.[featureName] === true;
  
  if (!featureEnabled) {
    throw new Error(
      `SaaS Feature Blocked: The feature '${featureName}' is not enabled in your current plan. Please upgrade your subscription plan to unlock this.`
    );
  }
  return true;
};

/**
 * RECALCULATE ACTIVE SAAS USAGE
 */
export const recalculateUsage = async (brandId) => {
  if (!brandId) return null;

  // Count active branches
  const branchesCount = await Restaurant.countDocuments({ brandId, isDeleted: { $ne: true }, isActive: true });

  // Count active tables across all branches of this brand
  const branchIds = await Restaurant.find({ brandId, isDeleted: { $ne: true }, isActive: true }).distinct("_id");
  const tablesCount = await Table.countDocuments({ branch: { $in: branchIds }, isDeleted: { $ne: true }, isActive: true });

  // Count active staff memberships under this brand
  const staffCount = await BranchMembership.countDocuments({ brandId, status: "active" });

  // Update or initialize SubscriptionUsage record
  const usage = await SubscriptionUsage.findOneAndUpdate(
    { brandId },
    {
      $set: {
        branchesUsed: branchesCount,
        tablesUsed: tablesCount,
        staffUsed: staffCount,
        lastCalculatedAt: new Date(),
      }
    },
    { upsert: true, new: true }
  );

  return usage;
};

export const checkReservationLimits = async (brandId, restaurantId) => {
  let usage = await SubscriptionUsage.findOne({ brandId });
  if (!usage) {
    usage = await recalculateUsage(brandId);
  }
  
  await checkLimit(brandId, "maxReservationsPerMonth", usage?.reservationsThisMonth || 0, 1);
};

export const incrementReservationUsage = async (brandId, restaurantId) => {
  await SubscriptionUsage.findOneAndUpdate(
    { brandId },
    { $inc: { reservationsThisMonth: 1 } },
    { upsert: true }
  );
};

