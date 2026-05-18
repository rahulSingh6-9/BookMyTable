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

export const emitRestaurantCreated = async (restaurant, ownerId, correlationId) => {
  return publishEvent({
    topic: RESTAURANT_TOPICS.RESTAURANT_CREATED,
    eventType: "restaurant.created",
    data: {
      id: restaurant._id?.toString() || restaurant.id,
      brandId: restaurant.brandId?.toString(),
      branchName: restaurant.branchName,
      branchCode: restaurant.branchCode,
      owner: ownerId.toString(),
      ownerId: ownerId.toString(),
      status: restaurant.status,
      logo: restaurant.logo || "",
      coverImage: restaurant.coverImage || "",
      images: restaurant.images || [],
      city: restaurant.address?.city,
      address: restaurant.address?.addressLine1,
      isActive: restaurant.isActive,
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

// Legacy compatibility and status changes
export const emitRestaurantStatusChanged = async (restaurant, action = "STATUS_CHANGED", metadata = {}) => {
  const ownerObj = restaurant.ownerId || {};
  const statusTopicMap = {
    "APPROVE_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_APPROVED,
    "REJECT_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_REJECTED,
    "SUSPEND_RESTAURANT": RESTAURANT_TOPICS.RESTAURANT_SUSPENDED,
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
      city: restaurant.address?.city,
      address: restaurant.address?.addressLine1,
      isActive: restaurant.isActive,
      updatedAt: restaurant.updatedAt || new Date(),
      action,
      ...metadata,
    },
    correlationId: restaurant.correlationId || metadata.correlationId,
  });
};
