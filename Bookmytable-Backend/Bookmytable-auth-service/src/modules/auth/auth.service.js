import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { sendEmail } from "../../utils/sendEmail.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";


const generateToken = (user, scope) => {
  return jwt.sign(
    {
      _id: user._id,
      roles: user.roles || [user.role], // support both
      scope, // 🔥 IMPORTANT
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
  if (scope === "admin" && !roles.includes("admin")) {
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

  // ✉️ Email content
  const html = `
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>This link will expire in 15 minutes.</p>
  `;

  // Send email
  await sendEmail(user.email, "Reset Your Password", html);

  return {
    message: "Reset link generated",
    // resetLink: `http://localhost:8080/reset-password?token=${rawToken}`
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