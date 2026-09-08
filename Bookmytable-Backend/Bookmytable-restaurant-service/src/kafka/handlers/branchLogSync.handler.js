import { createLog } from "../../modules/log/log.service.js";

/**
 * Handles mapping of database field names to user-friendly names for logs.
 */
const fieldMap = {
  branchName: "Branch Name",
  slug: "Branch Slug",
  description: "Description",
  cuisines: "Cuisines",
  logo: "Logo",
  coverImage: "Cover Image",
  images: "Photo Gallery",
  contact: "Contact Details",
  tags: "Social/Tags",
};

/**
 * Intercepts RESTAURANT_UPDATED partial events to inject grouped profile update logs
 */
export const handleBranchProfileLog = async (event) => {
  try {
    const { eventType, data } = event;

    // Only process partial updates for profiling grouping
    if (eventType !== "restaurant.updated.partial") return;
    
    if (!data) return;

    const { id, branchId, brandId, timestamp, actorId, ...delta } = data;
    
    // Determine changed fields
    const changedKeys = Object.keys(delta).filter(key => delta[key] !== undefined);
    
    if (changedKeys.length === 0) return;

    const friendlyChangedFields = changedKeys.map(key => fieldMap[key] || key);

    // Insert Grouped Log
    await createLog({
      action: "BRANCH_PROFILE_UPDATED",
      entityType: "branch",
      brandId: brandId,
      entityId: id || branchId,
      restaurant: id || branchId,
      performedBy: actorId, // Pulled dynamically from the new actorId payload
      metadata: { 
        changedFields: friendlyChangedFields,
      },
    });

    console.log(`📝 [BranchLogSync] Grouped log inserted for Branch ${id || branchId} | Changed Fields: ${friendlyChangedFields.join(", ")}`);

  } catch (error) {
    console.error("❌ [BranchLogSync] Error handling branch profile log:", error.message);
  }
};
