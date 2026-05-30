import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    password: {
      type: String,
      required: function() {
        return !this.authProviders?.google?.googleId;
      },
      minlength: 6,
      select: false,
    },

    // 🔥 MULTI ROLE SUPPORT
    roles: {
      type: [String],
      enum: [
        "customer", 
        "admin", 
        "super_admin",
        "SUPER_ADMIN",
        "PLATFORM_ADMIN",
        "SUPPORT_ADMIN",
        "FINANCE_ADMIN",
        "OPERATIONS_ADMIN",
        "CONTENT_MODERATOR",
        "ANALYTICS_ADMIN",
        "RESTAURANT_APPROVAL_MANAGER",
        "STAFF_MANAGEMENT_ADMIN",
      ],
      default: ["customer"],
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+\d{10,15}$/, "Phone number must be in international format (+countrycode...)"],
    },

    avatar: {
      type: String,
    },

    authProviders: {
      google: {
        googleId: { type: String, sparse: true, index: true },
        email: { type: String, lowercase: true }
      },
      apple: {
        id: String
      },
      phone: {
        id: String
      }
    },
    authType: {
      type: String,
      enum: ["email_password", "google"],
      default: "email_password"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// 🔐 HASH PASSWORD
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);