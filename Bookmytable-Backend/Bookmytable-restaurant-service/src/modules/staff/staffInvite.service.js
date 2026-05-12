import crypto from "crypto";
import StaffInvite from "../../models/staffInvite.model.js";
import Restaurant from "../../models/restaurant.model.js";
import { emitStaffInviteEvent } from "../../kafka/index.js";

// 🔐 Generate token
const generateToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, tokenHash };
};

export const inviteStaffService = async ({
  restaurantId,
  invitedBy,
  email,
  role,
  permissions,
}) => {
  // 1️⃣ Check branch exists
  const branch = await Restaurant.findById(restaurantId);

  if (!branch) throw new Error("Branch not found");

  // Note: Authorization is now handled by RBAC middleware at the route level

  // 2️⃣ Prevent duplicate active invite
  const existingInvite = await StaffInvite.findOne({
    email,
    branch: restaurantId,
    status: "pending",
  });

  if (existingInvite) {
    throw new Error("Invite already sent and is still pending");
  }

  // 3️⃣ Generate token
  const { rawToken, tokenHash } = generateToken();

  // 4️⃣ Create invite
  const invite = await StaffInvite.create({
    email,
    branch: restaurantId,
    brand: branch.brandId,
    role,
    permissions,
    invitedBy,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  // 5️⃣ 🔥 EMIT EVENT
  await emitStaffInviteEvent({
    email,
    role,
    restaurantName: branch.branchName || branch.name,
    inviteLink: `${
      process.env.FRONTEND_URL || process.env.WEB_URL
    }/accept-invite?token=${rawToken}`,
    invitedBy,
    restaurantId,
    inviteId: invite._id,
  });

  return invite;
};