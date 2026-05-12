import BranchMembership from "../../models/branchmemberships.model.js";
import Brand from "../../models/brand.model.js";

import {
  ROLE_PERMISSIONS,
} from "../../config/roles.js";

export const getUserMembershipsService =
async (userId) => {

  const memberships =
    await BranchMembership.find({
      user: userId,
      status: "active",
    })

    .populate({
      path: "brand",
      select: "name slug logo",
    })

    .populate({
      path: "branch",
      select: `
        branchName
        slug
        branchCode
        branchType
        contact
        address
        cuisines
        openingHours
        status
        logo
      `,
    })

    .lean();

  return memberships.map((membership) => {

    const rolePermissions =
      ROLE_PERMISSIONS[membership.role] || [];

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

      isPrimaryOwner:
        membership.isPrimaryOwner,

      brand: membership.brand,

      branch: membership.branch,
    };
  });
};