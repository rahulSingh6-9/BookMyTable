import crypto from "crypto";
import { producer } from "../config/kafka.js";
import { RESTAURANT_TOPICS } from "../topics/restaurant.topics.js";

/**
 * Standardized event publisher for Restaurant Service
 * Ensures all events conform to the enterprise payload standard:
 * { eventId, eventType, correlationId, timestamp, source, version, data, payload }
 */
export const publishEvent = async ({
  topic,
  eventType,
  data,
  correlationId = crypto.randomUUID(),
}) => {
  try {
    const event = {
      eventId: crypto.randomUUID(),
      eventType,
      correlationId: correlationId || data.correlationId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source: "restaurant-service",
      version: "1.0",
      data,
      payload: data, // Keep legacy payload support for existing consumers
    };

    await producer.send({
      topic,
      messages: [
        {
          key: (data.id || data.branchId || data.userId || "").toString() || undefined,
          value: JSON.stringify(event),
        },
      ],
      acks: -1, // Guarantee strong durability
    });

    console.log(`📡 [RestaurantService] Standardized Event published - Topic: ${topic}, Type: ${eventType}, ID: ${event.eventId}`);
    return event;
  } catch (error) {
    console.error(`❌ [RestaurantService] Failed to publish event ${eventType}:`, error.message);
    throw error;
  }
};

// --- Semantic Domain Event Emitters ---

export const emitBrandCreated = async (brand, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_CREATED,
    eventType: "brand.created",
    data: {
      id: brand._id?.toString() || brand.id,
      name: brand.name,
      slug: brand.slug,
      ownerId: brand.ownerId?.toString(),
      status: brand.status,
      logo: brand.logo || "",
      description: brand.description || "",
      isActive: brand.isActive,
      updatedAt: brand.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitBrandUpdated = async (brand, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_UPDATED,
    eventType: "brand.updated",
    data: {
      id: brand._id?.toString() || brand.id,
      name: brand.name,
      slug: brand.slug,
      ownerId: brand.ownerId?.toString(),
      status: brand.status,
      logo: brand.logo || "",
      description: brand.description || "",
      isActive: brand.isActive,
      updatedAt: brand.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitBrandDeactivated = async (brand, correlationId, extraData = {}) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_DEACTIVATED,
    eventType: "brand.deactivated",
    data: {
      id: brand._id?.toString() || brand.id,
      name: brand.name,
      slug: brand.slug,
      ownerId: brand.ownerId?.toString(),
      isActive: false,
      updatedAt: brand.updatedAt || new Date(),
      ...extraData
    },
    correlationId,
  });
};

export const emitBrandArchived = async (brand, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_ARCHIVED,
    eventType: "brand.archived",
    data: {
      id: brand._id?.toString() || brand.id,
      name: brand.name,
      slug: brand.slug,
      ownerId: brand.ownerId?.toString(),
      isDeleted: true,
      deletedAt: brand.deletedAt || new Date(),
      updatedAt: brand.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitBrandRestored = async (brand, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_RESTORED,
    eventType: "brand.restored",
    data: {
      id: brand._id?.toString() || brand.id,
      name: brand.name,
      slug: brand.slug,
      ownerId: brand.ownerId?.toString(),
      isActive: true,
      isDeleted: false,
      updatedAt: brand.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitRestaurantCreated = async (restaurant, ownerId, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.RESTAURANT_CREATED,
    eventType: "restaurant.created",
    data: {
      id: restaurant._id?.toString() || restaurant.id,
      brandId: restaurant.brandId?.toString(),
      branchName: restaurant.branchName,
      branchCode: restaurant.branchCode,
      slug: restaurant.slug,
      owner: ownerId.toString(),
      ownerId: ownerId.toString(),
      status: restaurant.status,
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      images: restaurant.images || [],
      city: restaurant.address?.city,
      address: restaurant.address?.addressLine1,
      isActive: restaurant.isActive,
      phoneVerified: restaurant.contact?.primaryPhone?.isVerified || false,
      email: restaurant.contact?.email || "",
      emailVerified: restaurant.contact?.isEmailVerified || false,
      emailVerifiedAt: restaurant.contact?.emailVerifiedAt,
      approvedAt: restaurant.approvedAt,
      rejectedAt: restaurant.rejectedAt,
      suspendedAt: restaurant.suspendedAt,
      createdAt: restaurant.createdAt || new Date(),
      updatedAt: restaurant.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitMembershipCreated = async (membership, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MEMBERSHIP_CREATED,
    eventType: "membership.created",
    data: {
      id: membership._id?.toString() || membership.id,
      userId: membership.user?.toString() || membership.userId,
      branchId: membership.branch?.toString() || membership.branchId,
      brandId: membership.brand?.toString() || membership.brandId,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt || new Date(),
      employeeId: membership.employeeId,
      designation: membership.designation,
      updatedAt: membership.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitMembershipDeleted = async (membership, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MEMBERSHIP_DELETED,
    eventType: "membership.deleted",
    data: {
      id: membership._id?.toString() || membership.id,
      userId: membership.user?.toString() || membership.userId,
      branchId: membership.branch?.toString() || membership.branchId,
      brandId: membership.brand?.toString() || membership.brandId,
      role: membership.role,
      status: membership.status,
      action: "MEMBERSHIP_DELETED"
    },
    correlationId,
  });
};

export const emitTableCreated = async (tableData, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.TABLE_CREATED,
    eventType: "table.created",
    data: {
      id: tableData._id?.toString() || tableData.id,
      branchId: tableData.branch?.toString() || tableData.branchId,
      brandId: tableData.brand?.toString() || tableData.brandId,
      tableCode: tableData.tableCode,
      capacity: tableData.capacity,
      type: tableData.type,
      status: tableData.status,
      isActive: tableData.isActive,
      updatedAt: tableData.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitTableUpdated = async (tableData, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.TABLE_UPDATED,
    eventType: "table.updated",
    data: {
      id: tableData._id?.toString() || tableData.id,
      branchId: tableData.branch?.toString() || tableData.branchId,
      brandId: tableData.brand?.toString() || tableData.brandId,
      tableCode: tableData.tableCode,
      status: tableData.status,
      isActive: tableData.isActive,
      updatedAt: tableData.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitTableDeleted = async (tableData, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.TABLE_DELETED,
    eventType: "table.deleted",
    data: {
      id: tableData._id?.toString() || tableData.id,
      branchId: tableData.branch?.toString() || tableData.branchId,
      brandId: tableData.brand?.toString() || tableData.brandId,
      isActive: tableData.isActive,
      updatedAt: tableData.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitTableBulkUpdated = async (branchId, brandId, count, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.TABLE_BULK_UPDATED,
    eventType: "table.bulk.updated",
    data: {
      branchId: branchId?.toString(),
      brandId: brandId?.toString(),
      count,
      updatedAt: new Date(),
    },
    correlationId,
  });
};

export const emitRestaurantOnboardingCompleted = async ({ branchId, brandId, ownerId, completionScore = 100 }, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.RESTAURANT_ONBOARDING_COMPLETED,
    eventType: "restaurant.onboarding.completed",
    data: {
      branchId,
      brandId,
      ownerId,
      completionScore,
      timestamp: Date.now(),
    },
    correlationId,
  });
};

export const emitNotificationEmailSend = async ({ template, recipient, variables, brandId, branchId }, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.NOTIFICATION_EMAIL_SEND,
    eventType: "notification.email.send",
    data: {
      template,
      recipient,
      variables,
      brandId,
      branchId,
      timestamp: Date.now(),
    },
    correlationId,
  });
};

// Partial Updates support to preserve Read-Model state for CQRS
export const emitRestaurantPartialUpdate = async (branchId, brandId, delta, correlationId, actorId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.RESTAURANT_UPDATED,
    eventType: "restaurant.updated.partial",
    data: {
      id: branchId?.toString() || branchId,
      branchId: branchId?.toString() || branchId,
      brandId: brandId?.toString() || brandId,
      ...delta,
      timestamp: Date.now(),
      actorId,
    },
    correlationId,
  });
};

export const emitBrandPartialUpdate = async (brandId, delta, correlationId, actorId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRAND_UPDATED,
    eventType: "brand.updated.partial",
    data: {
      id: brandId?.toString() || brandId,
      brandId: brandId?.toString() || brandId,
      ...delta,
      timestamp: Date.now(),
      actorId,
    },
    correlationId,
  });
};

// Legacy compatibility and status changes
export const emitRestaurantStatusChanged = async (restaurant, action = "STATUS_CHANGED", metadata = {}) => {
  const ownerObj = restaurant.ownerId || {};
  const statusTopicMap = {
    "APPROVE_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_APPROVED,
    "REJECT_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_REJECTED,
    "SUSPEND_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_SUSPENDED,
    "REMOVE_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_REMOVED,
    "PERMANENT_DELETE": RESTAURANT_TOPICS.RESTAURANT_REMOVED,
  };

  const topic = statusTopicMap[action] || RESTAURANT_TOPICS.RESTAURANT_UPDATED;
  const eventType = topic;

  return publishEvent({
    topic,
    eventType,
    data: {
      id: restaurant._id?.toString() || restaurant.id,
      branchId: restaurant._id?.toString() || restaurant.id,
      brandId: restaurant.brandId?.toString(),
      branchName: restaurant.branchName,
      branchCode: restaurant.branchCode,
      slug: restaurant.slug,
      status: restaurant.status,
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      images: restaurant.images || [],
      owner: {
        id: ownerObj._id?.toString() || ownerObj.id || restaurant.ownerId,
        name: ownerObj.name || "Owner",
        email: ownerObj.email || restaurant.contact?.email
      },
      ownerEmail: ownerObj.email || restaurant.contact?.email,
      email: restaurant.contact?.email || "",
      emailVerified: restaurant.contact?.isEmailVerified || false,
      emailVerifiedAt: restaurant.contact?.emailVerifiedAt,
      city: restaurant.address?.city,
      address: restaurant.address?.addressLine1,
      isActive: restaurant.isActive,
      isDeleted: restaurant.isDeleted || false,
      deletedAt: restaurant.deletedAt || null,
      phoneVerified: restaurant.contact?.primaryPhone?.isVerified || false,
      approvedAt: restaurant.approvedAt,
      rejectedAt: restaurant.rejectedAt,
      suspendedAt: restaurant.suspendedAt,
      updatedAt: restaurant.updatedAt || new Date(),
      action,
      ...metadata,
    },
    correlationId: restaurant.correlationId || metadata.correlationId,
  });
};

export const emitBranchCreationBlockedPlanLimit = async (brandId, ownerEmail, limitVal, currentCount, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BRANCH_CREATION_BLOCKED,
    eventType: "branch.creation.blocked.plan_limit",
    data: {
      brandId: brandId?.toString() || brandId,
      ownerEmail,
      limitType: "maxBranches",
      limitVal,
      currentCount,
      blockedAt: new Date(),
    },
    correlationId,
  });
};

export const emitSubscriptionPlanCreated = async (plan, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.SUBSCRIPTION_PLAN_CREATED,
    eventType: "subscription.plan.created",
    data: {
      id: plan._id?.toString() || plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      pricing: plan.pricing,
      limits: plan.limits,
      features: plan.features,
      isTrialPlan: plan.isTrialPlan,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      updatedAt: plan.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitSubscriptionPlanUpdated = async (plan, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.SUBSCRIPTION_PLAN_UPDATED,
    eventType: "subscription.plan.updated",
    data: {
      id: plan._id?.toString() || plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      pricing: plan.pricing,
      limits: plan.limits,
      features: plan.features,
      isTrialPlan: plan.isTrialPlan,
      trialDays: plan.trialDays,
      isActive: plan.isActive,
      updatedAt: plan.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitSubscriptionActivated = async (sub, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.SUBSCRIPTION_ACTIVATED,
    eventType: "subscription.activated",
    data: {
      id: sub._id?.toString() || sub.id,
      brandId: sub.brandId?.toString(),
      subscriptionPlanId: sub.subscriptionPlanId?._id?.toString() || sub.subscriptionPlanId?.toString(),
      status: sub.status,
      billingCycle: sub.billingCycle,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      trialEndsAt: sub.trialEndsAt,
      autoRenew: sub.autoRenew,
      paymentProvider: sub.paymentProvider,
      paymentReference: sub.paymentReference,
      createdBy: sub.createdBy?.toString(),
      lastPaymentAt: sub.lastPaymentAt,
      cancelledAt: sub.cancelledAt,
      updatedAt: sub.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitSubscriptionSuspended = async (sub, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.SUBSCRIPTION_SUSPENDED,
    eventType: "subscription.suspended",
    data: {
      id: sub._id?.toString() || sub.id,
      brandId: sub.brandId?.toString(),
      subscriptionPlanId: sub.subscriptionPlanId?._id?.toString() || sub.subscriptionPlanId?.toString(),
      status: sub.status,
      billingCycle: sub.billingCycle,
      startedAt: sub.startedAt,
      expiresAt: sub.expiresAt,
      trialEndsAt: sub.trialEndsAt,
      autoRenew: sub.autoRenew,
      paymentProvider: sub.paymentProvider,
      paymentReference: sub.paymentReference,
      createdBy: sub.createdBy?.toString(),
      lastPaymentAt: sub.lastPaymentAt,
      cancelledAt: sub.cancelledAt,
      updatedAt: sub.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitSubscriptionOverrideCreated = async (override, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.SUBSCRIPTION_OVERRIDE_CREATED,
    eventType: "subscription.override.created",
    data: {
      id: override._id?.toString() || override.id,
      brandId: override.brandId?.toString(),
      subscriptionId: override.subscriptionId?.toString(),
      overrideType: override.overrideType,
      reason: override.reason,
      details: override.details,
      appliedBy: override.appliedBy?.toString(),
      createdAt: override.createdAt || new Date(),
      updatedAt: override.updatedAt || new Date(),
    },
    correlationId,
  });
};

export const emitBillingUpdated = async (billing, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.BILLING_UPDATED,
    eventType: "billing.updated",
    data: {
      id: billing._id?.toString() || billing.id,
      brandId: billing.brandId?.toString(),
      subscriptionId: billing.subscriptionId?.toString(),
      amount: billing.amount,
      currency: billing.currency,
      paymentStatus: billing.paymentStatus,
      paymentProvider: billing.paymentProvider,
      transactionId: billing.transactionId,
      invoiceUrl: billing.invoiceUrl,
      paidAt: billing.paidAt,
      metadata: billing.metadata,
      updatedAt: billing.updatedAt || new Date(),
    },
    correlationId,
  });
};

// Menu Events
export const emitMenuItemCreated = async (item, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_ITEM_CREATED,
    eventType: "menu.item.created",
    data: {
      id: item._id?.toString() || item.id,
      branchId: item.branch?.toString() || item.branchId,
      brandId: item.brand?.toString() || item.brandId,
      categoryId: item.category?.toString() || item.categoryId,
    },
    correlationId,
  });
};

export const emitMenuItemUpdated = async (item, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_ITEM_UPDATED,
    eventType: "menu.item.updated",
    data: {
      id: item._id?.toString() || item.id,
      branchId: item.branch?.toString() || item.branchId,
      brandId: item.brand?.toString() || item.brandId,
      categoryId: item.category?.toString() || item.categoryId,
    },
    correlationId,
  });
};

export const emitMenuItemDeleted = async (item, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_ITEM_DELETED,
    eventType: "menu.item.deleted",
    data: {
      id: item._id?.toString() || item.id,
      branchId: item.branch?.toString() || item.branchId,
      brandId: item.brand?.toString() || item.brandId,
      categoryId: item.category?.toString() || item.categoryId,
    },
    correlationId,
  });
};

export const emitMenuCategoryCreated = async (category, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_CATEGORY_CREATED,
    eventType: "menu.category.created",
    data: {
      id: category._id?.toString() || category.id,
      branchId: category.branch?.toString() || category.branchId,
      brandId: category.brand?.toString() || category.brandId,
    },
    correlationId,
  });
};

export const emitMenuCategoryUpdated = async (category, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_CATEGORY_UPDATED,
    eventType: "menu.category.updated",
    data: {
      id: category._id?.toString() || category.id,
      branchId: category.branch?.toString() || category.branchId,
      brandId: category.brand?.toString() || category.brandId,
    },
    correlationId,
  });
};

export const emitMenuCategoryDeleted = async (category, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.MENU_CATEGORY_DELETED,
    eventType: "menu.category.deleted",
    data: {
      id: category._id?.toString() || category.id,
      branchId: category.branch?.toString() || category.branchId,
      brandId: category.brand?.toString() || category.brandId,
    },
    correlationId,
  });
};
