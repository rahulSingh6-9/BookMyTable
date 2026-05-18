import crypto from "crypto";

/**
 * Standardized Admin Event Builder
 * Enforces the enterprise standard envelope:
 * { eventId, eventType, correlationId, timestamp, source, version, data }
 * plus root-level action, branchId, approvedBy for specific command payloads.
 */
export const buildAdminEvent = ({
  source = "admin-service",
  type = "admin.command",
  action,
  payload,
  adminContext, // { id, role, permissions }
  tenantContext = {}, // { brandId, branchId, region }
  correlationId = crypto.randomUUID(),
}) => {
  const targetId = payload?.id || payload?.branchId || payload?.userId;
  const adminId = adminContext?.id;

  return {
    eventId: crypto.randomUUID(),
    eventType: type,
    correlationId: correlationId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source,
    version: "1.0",

    // Root properties requested for specific command payload compatibility
    action,
    branchId: targetId,
    approvedBy: adminId,

    // Legacy fields for backward compatibility
    id: crypto.randomUUID(),
    type: `com.bookmytable.${type}`,
    specversion: "1.0",
    time: new Date().toISOString(),
    actor: {
      id: adminId,
      type: "ADMIN",
      role: adminContext?.role,
      permissions: adminContext?.permissions || [],
    },
    context: {
      brandId: tenantContext?.brandId || tenantContext?.brandId,
      branchId: tenantContext?.branchId || targetId,
      region: tenantContext?.region,
    },
    
    // Standard data and legacy payload fields
    data: {
      action,
      branchId: targetId,
      approvedBy: adminId,
      id: targetId,
      ...payload
    },
    payload: {
      action,
      branchId: targetId,
      approvedBy: adminId,
      id: targetId,
      ...payload
    }
  };
};
