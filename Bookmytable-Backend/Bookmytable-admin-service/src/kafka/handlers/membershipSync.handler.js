import MembershipReadModel from "../../models/membershipReadModel.js";

export const syncMembership = async (data) => {
  const membershipId = data?.id || data?._id;

  if (!membershipId) {
    console.error("❌ No Membership ID found for sync:", data);
    return;
  }

  const incomingUpdatedAt = new Date(data.updatedAt || Date.now());
  const existing = await MembershipReadModel.findById(membershipId);

  if (existing && existing.updatedAt && incomingUpdatedAt < existing.updatedAt) {
    return;
  }

  const { __v, ...safeData } = data;

  await MembershipReadModel.findByIdAndUpdate(
    membershipId,
    {
      $set: {
        ...safeData,
        _id: membershipId,
        updatedAt: incomingUpdatedAt,
      }
    },
    { upsert: true, new: true }
  );

  console.log(`🎫 Membership Read-Model Synced: ${membershipId}`);
};
