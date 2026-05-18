import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { emitEvent, AUTH_TOPICS } from "../../kafka/index.js";


const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["*"], // Wildcard for all
  PLATFORM_ADMIN: ["users.view", "users.edit", "restaurants.view", "restaurants.approve", "brands.view", "branches.view", "analytics.view", "settings.manage"],
  SUPPORT_ADMIN: ["users.view", "restaurants.view", "bookings.view", "tickets.view", "support.manage"],
  FINANCE_ADMIN: ["payments.view", "payments.manage", "revenue.view", "reports.export"],
  ANALYTICS_ADMIN: ["analytics.view", "reports.export", "restaurants.view"],
  RESTAURANT_APPROVAL_MANAGER: ["restaurants.view", "restaurants.approve", "restaurants.suspend", "brands.view"],
};

const generateToken = (user, scope) => {
  const roles = user.roles || [user.role];
  
  // Calculate aggregate permissions
  let permissions = [];
  if (roles.includes("super_admin") || roles.includes("SUPER_ADMIN")) {
    permissions = ["*"];
  } else {
    roles.forEach(role => {
      if (ROLE_PERMISSIONS[role]) {
        permissions = [...new Set([...permissions, ...ROLE_PERMISSIONS[role]])];
      }
    });
  }

  return jwt.sign(
    {
      _id: user._id,
      roles,
      permissions, // 🔥 Inject permissions
      scope,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// 🔥 LOGIN USERS
const loginUser = async ({ email, password, scope }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (user.isBlocked) {
    const error = new Error("User is blocked");
    error.status = 403;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid credentials");
    error.status = 401;
    throw error;
  }

  const roles = user.roles || [user.role];

  // 🚨 ADMIN CHECK
  const adminRoles = [
    "admin", "super_admin", "SUPER_ADMIN", "PLATFORM_ADMIN", 
    "SUPPORT_ADMIN", "FINANCE_ADMIN", "OPERATIONS_ADMIN", 
    "CONTENT_MODERATOR", "ANALYTICS_ADMIN", "RESTAURANT_APPROVAL_MANAGER", 
    "STAFF_MANAGEMENT_ADMIN"
  ];
  
  if (scope === "admin" && !roles.some(role => adminRoles.includes(role))) {
    const error = new Error("Not authorized for admin panel");
    error.status = 403;
    throw error;
  }

  const token = generateToken(user, scope);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles,   // ✅ updated
    },
    scope,     // ✅ return scope
  };
};

// 🔥 LOGIN Web USERS
export const loginWebUser = async (data) => {
  return loginUser({ ...data, scope: "web" });
};

// 🔥 LOGIN Admin USERS
export const loginAdminUser = async (data) => {
  return loginUser({ ...data, scope: "admin" });
};



const formatPhone = (phone) => {
  const phoneNumber = parsePhoneNumberFromString(phone);

  if (!phoneNumber || !phoneNumber.isValid()) {
    throw new Error("Invalid phone number");
  }

  return phoneNumber.number; // E.164 format
}

// 🔥 SIGNUP
export const signupUser = async ({ name, email, password, phone }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }
  
  const formattedPhone = formatPhone(phone)

  const user = await User.create({
    name,
    email,
    password,
    phone: formattedPhone,
    roles: ["customer"], // ✅ default role
  });

  const token = generateToken(user, "web");

  // 📡 Emit USER_REGISTERED event via Kafka
  try {
    await emitEvent(AUTH_TOPICS.USER_REGISTERED, {
      id: user._id.toString(),
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
    });
  } catch (err) {
    console.error("❌ Failed to emit USER_REGISTERED event on signup:", err.message);
  }

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
    scope: "web",
  };
};



export const forgotPassword = async ({ email }) => {
  const user = await User.findOne({ email })

  if (!user || user.isBlocked) {
   return {
    message: "If account exists, reset link sent"
   };
  }
 
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
  .createHash("sha256")
  .update(rawToken)
  .digest("hex");

  // Save in DB
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

  await user.save();

  const resetLink = `${process.env.WEB_URL}/reset-password?token=${rawToken}`;

  // 🔥 Emit Kafka Event instead of direct email
  await emitEvent(AUTH_TOPICS.PASSWORD_RESET_REQUESTED, {
    email: user.email,
    name: user.name,
    resetLink,
    expiresIn: "15 minutes"
  });

  return {
    message: "Reset link generated and sent via notification service",
  }
}


export const resetPassword = async ({ token, newPassword }) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return { message: "Password reset successful" };
};

export const verifyResetToken = async (token) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  return { success: true, message: "Token is valid" };
};