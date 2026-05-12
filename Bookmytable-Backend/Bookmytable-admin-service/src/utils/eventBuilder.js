import crypto from "crypto";

/**
 * Professional SaaS Event Builder
 * Follows CloudEvents-like structure for cross-service consistency
 */
export const buildAdminEvent = ({
  source = "admin-service",
  type,
  action,
  payload,
  adminContext, // { id, role, permissions }
  tenantContext = {}, // { brandId, branchId, region }
  correlationId = crypto.randomUUID(),
}) => {
  return {
    id: crypto.randomUUID(),
    source,
    type: `com.bookmytable.${type}`,
    action,
    specversion: "1.0",
    time: new Date().toISOString(),
    correlationId,
    actor: {
      id: adminContext?.id,
      type: "ADMIN",
      role: adminContext?.role,
      permissions: adminContext?.permissions || [],
    },
    context: {
      brandId: tenantContext?.brandId,
      branchId: tenantContext?.branchId,
      region: tenantContext?.region,
    },
    data: payload,
  };
};
