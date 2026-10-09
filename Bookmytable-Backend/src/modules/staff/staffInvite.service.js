import crypto from "crypto";
import StaffInvite from "../../models/staffInvite.model.js";
import Restaurant from "../../models/restaurant.model.js";
import User from "../../models/user.model.js";
import Brand from "../../models/brand.model.js";
import BranchMembership from "../../models/branchmemberships.model.js";
import notificationService from "../notification/notification.service.js";
import { checkLimit } from "../subscriptions/subscription.service.js";

// 🔐 Generate token
export const generateToken = () => {
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

  // 1b. Check SaaS staff limits
  const currentStaffCount = await BranchMembership.countDocuments({ brand: branch.brandId, status: "active" });
  await checkLimit(branch.brandId, "maxStaff", currentStaffCount);

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

  // Fetch contextual metadata for rich emails
  const inviter = await User.findById(invitedBy).select("name email");
  const brandDoc = branch.brandId ? await Brand.findById(branch.brandId).select("name logo") : null;

  const inviteLink = `${
    process.env.WEB_URL || process.env.FRONTEND_URL || "http://localhost:8080"
  }/accept-invite?token=${rawToken}`;

  // 5️⃣ Send Email directly
  await notificationService.sendStaffInvite({
    email,
    role,
    restaurantName: branch.branchName || branch.name || brandDoc?.name || "the restaurant",
    brandName: brandDoc?.name || "",
    branchName: branch.branchName || branch.name || "",
    inviterName: inviter?.name || "A Team Member",
    inviteLink,
    logo: branch.logo || brandDoc?.logo,
    coverImage: branch.coverImage,
  });

  return invite;
};
