import SubscriptionPlanReadModel from "../../models/subscriptionPlanReadModel.js";
import BrandSubscriptionReadModel from "../../models/brandSubscriptionReadModel.js";
import BillingReadModel from "../../models/billingReadModel.js";
import SubscriptionOverrideReadModel from "../../models/subscriptionOverrideReadModel.js";
import BrandReadModel from "../../models/brandReadModel.js";
import axios from "axios";
import { createAdminLog } from "../../services/adminLog.service.js";

export const getPlans = async () => {
  return SubscriptionPlanReadModel.find().sort({ createdAt: -1 });
};

export const getActiveSubscriptions = async () => {
  // Populate brand details and plan details
  const subs = await BrandSubscriptionReadModel.find()
    .populate("brandId")
    .populate("subscriptionPlanId")
    .sort({ createdAt: -1 });
  
  return subs;
};

export const getBillingHistory = async () => {
  const billing = await BillingReadModel.find()
    .populate("brandId")
    .populate("subscriptionId")
    .sort({ createdAt: -1 });

  return billing;
};

export const getOverridesHistory = async () => {
  const overrides = await SubscriptionOverrideReadModel.find()
    .populate("brandId")
    .populate("subscriptionId")
    .sort({ createdAt: -1 });

  return overrides;
};

export const getDashboardStats = async () => {
  const [totalPlans, totalSubs, billingDocs, overridesCount] = await Promise.all([
    SubscriptionPlanReadModel.countDocuments(),
    BrandSubscriptionReadModel.find().populate("subscriptionPlanId"),
    BillingReadModel.find({ paymentStatus: "paid" }),
    SubscriptionOverrideReadModel.countDocuments()
  ]);

  const activeCount = totalSubs.filter(s => s.status === "active").length;
  const trialCount = totalSubs.filter(s => s.status === "trial").length;
  const suspendedCount = totalSubs.filter(s => s.status === "suspended").length;
  const expiredCount = totalSubs.filter(s => s.status === "expired" || s.status === "cancelled").length;

  const totalRevenue = billingDocs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Growth / breakdown metrics
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

export const createPlanService = async (data, adminContext, authHeader) => {
  const response = await axios.post(
    `${process.env.RESTAURANT_SERVICE_URL}/subscriptions/plans`,
    data,
    {
      headers: {
        Authorization: authHeader,
        "x-internal-gateway": process.env.GATEWAY_SECRET,
        "x-user-id": adminContext.id,
        "x-user-roles": JSON.stringify(adminContext.roles || ["admin"]),
      },
    }
  );

  const plan = response.data.data;

  // Safe Audit log
  await createAdminLog({
    adminId: adminContext.id,
    action: "CREATE_SUBSCRIPTION_PLAN",
    targetType: "SubscriptionPlan",
    targetId: plan._id || plan.id,
    metadata: {
      planName: data.name,
      pricing: data.pricing,
      limits: data.limits,
      features: data.features,
    },
  });

  return plan;
};

export const updatePlanService = async (id, data, adminContext, authHeader) => {
  const existingPlan = await SubscriptionPlanReadModel.findById(id);

  const response = await axios.put(
    `${process.env.RESTAURANT_SERVICE_URL}/subscriptions/plans/${id}`,
    data,
    {
      headers: {
        Authorization: authHeader,
        "x-internal-gateway": process.env.GATEWAY_SECRET,
        "x-user-id": adminContext.id,
        "x-user-roles": JSON.stringify(adminContext.roles || ["admin"]),
      },
    }
  );

  const updatedPlan = response.data.data;

  // Safe differential Audit logs
  if (existingPlan) {
    if (data.pricing) {
      const monthlyChanged = data.pricing.monthly !== undefined && Number(data.pricing.monthly) !== existingPlan.pricing?.monthly;
      const yearlyChanged = data.pricing.yearly !== undefined && Number(data.pricing.yearly) !== existingPlan.pricing?.yearly;
      if (monthlyChanged || yearlyChanged) {
        await createAdminLog({
          adminId: adminContext.id,
          action: "UPDATE_SUBSCRIPTION_PRICING",
          targetType: "SubscriptionPlan",
          targetId: id,
          metadata: {
            planName: existingPlan.name,
            before: existingPlan.pricing,
            after: {
              monthly: data.pricing.monthly !== undefined ? Number(data.pricing.monthly) : existingPlan.pricing?.monthly,
              yearly: data.pricing.yearly !== undefined ? Number(data.pricing.yearly) : existingPlan.pricing?.yearly,
            },
          },
        });
      }
    }

    if (data.limits) {
      const changedLimits = {};
      const beforeLimits = {};
      const afterLimits = {};
      let limitsChanged = false;

      for (const [key, value] of Object.entries(data.limits)) {
        if (value !== undefined && Number(value) !== existingPlan.limits?.[key]) {
          changedLimits[key] = Number(value);
          beforeLimits[key] = existingPlan.limits?.[key];
          afterLimits[key] = Number(value);
          limitsChanged = true;
        }
      }

      if (limitsChanged) {
        await createAdminLog({
          adminId: adminContext.id,
          action: "UPDATE_SUBSCRIPTION_LIMITS",
          targetType: "SubscriptionPlan",
          targetId: id,
          metadata: {
            planName: existingPlan.name,
            before: beforeLimits,
            after: afterLimits,
          },
        });
      }
    }

    if (data.features) {
      const changedFeatures = {};
      const beforeFeatures = {};
      const afterFeatures = {};
      let featuresChanged = false;

      for (const [key, value] of Object.entries(data.features)) {
        const valBool = !!value;
        if (value !== undefined && valBool !== existingPlan.features?.[key]) {
          changedFeatures[key] = valBool;
          beforeFeatures[key] = existingPlan.features?.[key];
          afterFeatures[key] = valBool;
          featuresChanged = true;
        }
      }

      if (featuresChanged) {
        await createAdminLog({
          adminId: adminContext.id,
          action: "UPDATE_SUBSCRIPTION_FEATURES",
          targetType: "SubscriptionPlan",
          targetId: id,
          metadata: {
            planName: existingPlan.name,
            before: beforeFeatures,
            after: afterFeatures,
          },
        });
      }
    }
  }

  return updatedPlan;
};

export const applyOverrideService = async (data, adminContext, authHeader) => {
  const response = await axios.post(
    `${process.env.RESTAURANT_SERVICE_URL}/subscriptions/overrides`,
    data,
    {
      headers: {
        Authorization: authHeader,
        "x-internal-gateway": process.env.GATEWAY_SECRET,
        "x-user-id": adminContext.id,
        "x-user-roles": JSON.stringify(adminContext.roles || ["admin"]),
      },
    }
  );

  const result = response.data.data;

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

  await createAdminLog({
    adminId: adminContext.id,
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
