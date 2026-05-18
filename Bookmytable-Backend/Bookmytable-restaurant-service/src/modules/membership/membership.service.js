import BranchMembership from "../../models/branchmemberships.model.js";
import Brand from "../../models/brand.model.js";

import {
  ROLE_PERMISSIONS,
} from "../../config/roles.js";

export const getUserMembershipsService = async (userId) => {
  const memberships = await BranchMembership.find({
    user: userId,
    status: "active",
  })
    .populate("brand")
    .populate("branch")
    .lean();

  return memberships.map((membership) => {
    const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];

    return {
      _id: membership._id,
      role: membership.role,
      permissions: [
        ...new Set([
          ...rolePermissions,
          ...(membership.permissions?.map((p) => p.action) || []),
        ]),
      ],
      status: membership.status,
      isPrimaryOwner: membership.isPrimaryOwner,
      brand: membership.brand,
      branch: membership.branch ? {
        ...membership.branch,
        // Normalize branchName consistently for the frontend
        branchName: membership.branch.branchName || membership.branch.name || membership.branch.restaurantName || "Unnamed Branch"
      } : null
    };
  });
};