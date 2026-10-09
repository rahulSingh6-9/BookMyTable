import { SubscriptionPlan } from "../../../models/subscriptionPlan.model.js";
import { BrandSubscription } from "../../../models/brandSubscription.model.js";
import { BillingHistory } from "../../../models/billingHistory.model.js";
import Brand from "../../../models/brand.model.js";
import AdminLog from "../../../models/adminLog.model.js";
import { 
  createPlan, 
  updatePlan, 
  archivePlan, 
  restorePlan, 
  applyOverride 
} from "../../subscriptions/subscription.service.js";

export const getPlans = async () => {
  return SubscriptionPlan.find().sort({ createdAt: -1 });
};

export const getActiveSubscriptions = async () => {
  const subs = await BrandSubscription.find()
    .populate("brandId")
    .populate("subscriptionPlanId")
    .sort({ createdAt: -1 });
  
  return subs;
};

export const getBillingHistory = async () => {
  const billing = await BillingHistory.find()
    .populate("brandId")
    .populate("subscriptionId")
    .sort({ createdAt: -1 });

  return billing;
};

export const getOverridesHistory = async () => {
  const overrideLogs = await AdminLog.find({
    action: { 
      $in: [
        "EXTEND_SUBSCRIPTION_TRIAL", 
        "UPGRADE_SUBSCRIPTION", 
        "DOWNGRADE_SUBSCRIPTION", 
        "REACTIVATE_SUBSCRIPTION", 
        "SUSPEND_SUBSCRIPTION", 
        "GRACE_PERIOD_GRANTED",
        "SUBSCRIPTION_UPDATED"
      ] 
    }
  }).sort({ createdAt: -1 });

  return overrideLogs;
};

export const getDashboardStats = async () => {
  const [totalPlans, totalSubs, billingDocs, overridesCount] = await Promise.all([
    SubscriptionPlan.countDocuments(),
    BrandSubscription.find().populate("subscriptionPlanId"),
    BillingHistory.find({ paymentStatus: "paid" }),
    AdminLog.countDocuments({ action: { $regex: "SUBSCRIPTION" } })
  ]);

  const activeCount = totalSubs.filter(s => s.status === "active").length;
  const trialCount = totalSubs.filter(s => s.status === "trial").length;
  const suspendedCount = totalSubs.filter(s => s.status === "suspended").length;
  const expiredCount = totalSubs.filter(s => s.status === "expired" || s.status === "cancelled").length;

  const totalRevenue = billingDocs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const planBreakdown = {};
  totalSubs.forEach(sub => {
    const planName = sub.subscriptionPlanId?.name || "Unknown Plan";
    planBreakdown[planName] = (planBreakdown[planName] || 0) + 1;
  });

  return {
    plansCount: totalPlans,
    totalSubscriptions: totalSubs.length,
    activeSubscriptions: activeCount,
    trialSubscriptions: trialCount,
    suspendedSubscriptions: suspendedCount,
    expiredSubscriptions: expiredCount,
    totalRevenue,
    overridesCount,
    planBreakdown
  };
};

export const createPlanService = async (data, adminContext) => {
  const plan = await createPlan(data);

  await AdminLog.create({
    adminId: adminContext.id || adminContext._id,
    action: "CREATE_SUBSCRIPTION_PLAN",
    targetType: "SubscriptionPlan",
    targetId: plan._id,
    metadata: {
      planName: data.name,
      pricing: data.pricing,
      limits: data.limits,
      features: data.features,
    },
  });

  return plan;
};

export const updatePlanService = async (id, data, adminContext) => {
  const existingPlan = await SubscriptionPlan.findById(id);
  const updatedPlan = await updatePlan(id, data);

  if (existingPlan) {
    await AdminLog.create({
      adminId: adminContext.id || adminContext._id,
      action: "UPDATE_SUBSCRIPTION_PLAN",
      targetType: "SubscriptionPlan",
      targetId: id,
      metadata: {
        planName: existingPlan.name,
        before: existingPlan,
        after: updatedPlan,
      },
    });
  }

  return updatedPlan;
};

export const archivePlanService = async (id, adminContext) => {
  const archivedPlan = await archivePlan(id);

  await AdminLog.create({
    adminId: adminContext.id || adminContext._id,
    action: "ARCHIVE_SUBSCRIPTION_PLAN",
    targetType: "SubscriptionPlan",
    targetId: id,
    metadata: {
      planName: archivedPlan.name,
    },
  });

  return archivedPlan;
};

export const restorePlanService = async (id, adminContext) => {
  const restoredPlan = await restorePlan(id);

  await AdminLog.create({
    adminId: adminContext.id || adminContext._id,
    action: "RESTORE_SUBSCRIPTION_PLAN",
    targetType: "SubscriptionPlan",
    targetId: id,
    metadata: {
      planName: restoredPlan.name,
    },
  });

  return restoredPlan;
};

export const applyOverrideService = async (data, adminContext) => {
  const result = await applyOverride(data, adminContext.id || adminContext._id);

  let logAction = "EXTEND_SUBSCRIPTION_TRIAL";
  const type = data.overrideType;
  if (type === "trial_extension") {
    logAction = "EXTEND_SUBSCRIPTION_TRIAL";
  } else if (type === "temporary_upgrade") {
    logAction = "UPGRADE_SUBSCRIPTION";
  } else if (type === "downgrade") {
    logAction = "DOWNGRADE_SUBSCRIPTION";
  } else if (type === "reactivate") {
    logAction = "REACTIVATE_SUBSCRIPTION";
  } else if (type === "suspend") {
    logAction = "SUSPEND_SUBSCRIPTION";
  } else if (type === "grace_period") {
    logAction = "GRACE_PERIOD_GRANTED";
  }

  await AdminLog.create({
    adminId: adminContext.id || adminContext._id,
    action: logAction,
    targetType: "BrandSubscription",
    targetId: data.brandId,
    metadata: {
      reason: data.reason,
      details: data.details,
    },
  });

  return result;
};
