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
  ownerId,
  email,
  role,
  permissions,
}) => {
  // 1️⃣ Check restaurant ownership
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) throw new Error("Restaurant not found");

  if (restaurant.owner.toString() !== ownerId) {
    throw new Error("Unauthorized");
  }

  // 2️⃣ Prevent duplicate active invite
  const existingInvite = await StaffInvite.findOne({
    email,
    restaurant: restaurantId,
    status: "pending",
  });

  if (existingInvite) {
    throw new Error("Invite already sent");
  }

  // 3️⃣ Generate token
  const { rawToken, tokenHash } = generateToken();

  // 4️⃣ Create invite
  const invite = await StaffInvite.create({
    email,
    restaurant: restaurantId,
    role,
    permissions,
    invitedBy: ownerId,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  // 5️⃣ 🔥 EMIT EVENT (replace email sending)
  await emitStaffInviteEvent({
    email,
    role,
    restaurantName: restaurant.name,
    inviteLink: `${
      process.env.FRONTEND_URL || process.env.WEB_URL
    }/accept-invite?token=${rawToken}`,
    invitedBy: ownerId,
    restaurantId,
    inviteId: invite._id,
  });

  return invite;
};