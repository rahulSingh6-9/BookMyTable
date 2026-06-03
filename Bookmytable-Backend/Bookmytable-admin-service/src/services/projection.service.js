import UserReadModel from "../models/userReadModel.js";
import BrandReadModel from "../models/brandReadModel.js";
import BranchReadModel from "../models/branchReadModel.js";
import MembershipReadModel from "../models/membershipReadModel.js";

/**
 * Rebuilds the user projections for a given userId based on their memberships.
 */
export const rebuildUserProjections = async (userId) => {
  if (!userId) return;

  try {
    const memberships = await MembershipReadModel.find({ userId: userId });
    
    // Using a Map for deduplication of owned restaurants
    const ownedRestaurantsMap = new Map();
    const staffAffiliations = [];

    for (const m of memberships) {
      if (m.status !== "active") continue; // Only count active memberships? Wait, even inactive might be useful, but let's stick to all for now or active? Admin probably needs to see all. Let's include all.
      
      let branchName = "Unknown Branch";
      let branchStatus = "unknown";
      
      if (m.branchId) {
        const branch = await BranchReadModel.findById(m.branchId);
        if (branch) {
          branchName = branch.branchName || branch.name || branchName;
          branchStatus = branch.status || branchStatus;
        }
      } else if (m.brandId && m.role === "owner") {
        // Brand owner - they own the brand, which might mean they own multiple branches
        // But the data structure expects just branch id. We'll add the brand as an "owned" entity
        const brand = await BrandReadModel.findById(m.brandId);
        if (brand) {
          ownedRestaurantsMap.set(m.brandId, {
            id: m.brandId,
            name: `${brand.name} (Brand)`,
            status: brand.status || "approved",
          });
        }
      }

      if (m.role === "owner" || m.role === "co_owner") {
        if (m.branchId) {
          ownedRestaurantsMap.set(m.branchId, {
            id: m.branchId,
            name: branchName,
            status: branchStatus,
          });
        }
      } else {
        if (m.branchId) {
          staffAffiliations.push({
            branchId: m.branchId,
            branchName: branchName,
            role: m.role,
            status: m.status,
          });
        }
      }
    }

    await UserReadModel.findByIdAndUpdate(userId, {
      $set: {
        totalMemberships: memberships.length,
        ownedRestaurants: Array.from(ownedRestaurantsMap.values()),
        staffAffiliations,
      }
    });
    console.log(`✅ [Projections] Rebuilt User metrics for ${userId}`);
  } catch (error) {
    console.error(`❌ [Projections] Failed to rebuild User metrics for ${userId}`, error);
  }
};

/**
 * Rebuilds the brand metrics for a given brandId based on branches and memberships.
 */
export const rebuildBrandMetrics = async (brandId) => {
  if (!brandId) return;

  try {
    const branches = await BranchReadModel.find({ brandId, isDeleted: { $ne: true } });
    
    let activeBranches = 0;
    let deactivatedBranches = 0;
    let pendingBranches = 0;
    let suspendedBranches = 0;

    branches.forEach(b => {
      if (b.status === "approved" || b.isActive) activeBranches++;
      if (b.status === "pending") pendingBranches++;
      if (b.status === "suspended") suspendedBranches++;
      if (!b.isActive && b.status !== "pending" && b.status !== "suspended") deactivatedBranches++;
    });

    const staffCount = await MembershipReadModel.countDocuments({ brandId: brandId, status: "active" });

    await BrandReadModel.findByIdAndUpdate(brandId, {
      $set: {
        totalBranches: branches.length,
        activeBranches,
        deactivatedBranches,
        pendingBranches,
        suspendedBranches,
        staffCount,
      }
    });
    console.log(`✅ [Projections] Rebuilt Brand metrics for ${brandId}`);
  } catch (error) {
    console.error(`❌ [Projections] Failed to rebuild Brand metrics for ${brandId}`, error);
  }
};

/**
 * Rebuilds the branch metrics for a given branchId.
 */
export const rebuildBranchMetrics = async (branchId) => {
  if (!branchId) return;

  try {
    const staffCount = await MembershipReadModel.countDocuments({ branchId: branchId, status: "active" });
    
    await BranchReadModel.findByIdAndUpdate(branchId, {
      $set: {
        staffCount
      }
    });
    console.log(`✅ [Projections] Rebuilt Branch metrics for ${branchId}`);
  } catch (error) {
    console.error(`❌ [Projections] Failed to rebuild Branch metrics for ${branchId}`, error);
  }
};
