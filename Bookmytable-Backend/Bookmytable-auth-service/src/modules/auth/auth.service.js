import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { emitEvent, AUTH_TOPICS } from "../../kafka/index.js";
import { OAuth2Client } from "google-auth-library";


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


async function run() {
  try {
    const users = await User.find();

    console.log(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
}

run();

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

// 🔥 GOOGLE OAUTH SIGNUP/LOGIN SERVICE
export const googleAuthService = async ({ idToken }) => {
  if (!idToken) {
    throw new Error("Google ID token is required");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || "180295844498-mockclientid.apps.googleusercontent.com";
  const client = new OAuth2Client(clientId);
  
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch (error) {
    console.error("❌ Google token verification failed:", error.message);
    throw new Error("Invalid Google token signature or expired session");
  }

  if (!payload) {
    throw new Error("Failed to parse Google token payload");
  }

  const { email, name, sub: googleId, picture } = payload;

  if (!email) {
    throw new Error("Email not provided by Google account");
  }

  // 1. Check if user already exists by email
  let user = await User.findOne({ email });
  let isNewUser = false;

  if (user) {
    if (user.isBlocked) {
      throw new Error("User account is blocked");
    }

    // Link provider if not linked yet
    if (!user.authProviders?.google?.googleId) {
      if (!user.authProviders) {
        user.authProviders = {};
      }
      if (!user.authProviders.google) {
        user.authProviders.google = {};
      }
      user.authProviders.google.googleId = googleId;
      user.authProviders.google.email = email;
      user.authType = "google";
      user.isEmailVerified = true;
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }
  } else {
    // 2. Create new user (password is conditionally optional since googleId is provided)
    isNewUser = true;
    user = await User.create({
      name: name || "Google User",
      email,
      avatar: picture || "",
      authType: "google",
      authProviders: {
        google: {
          googleId,
          email,
        },
      },
      roles: ["customer"],
      isEmailVerified: true,
      isPhoneVerified: false,
    });

    // 📡 Emit USER_REGISTERED event via Kafka
    try {
      await emitEvent(AUTH_TOPICS.USER_REGISTERED, {
        id: user._id.toString(),
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        roles: user.roles,
        avatar: user.avatar || "",
      });
    } catch (err) {
      console.error("❌ Failed to emit USER_REGISTERED event on Google signup:", err.message);
    }
  }

  const token = generateToken(user, "web");

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
    },
    scope: "web",
    isNewUser,
  };
};