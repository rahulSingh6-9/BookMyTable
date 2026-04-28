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
      required: true,
      minlength: 6,
      select: false, // 🔥 password hide by default
    },

    // 🔥 MULTI ROLE SUPPORT
    roles: {
      type: [String],
      enum: ["customer", "owner", "admin", "staff"],
      default: ["customer"],
      index: true,
    },

    phone: {
      type: String,
    },

    avatar: {
      type: String,
    },

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// 🔥 HASH PASSWORD BEFORE SAVE
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔥 COMPARE PASSWORD METHOD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
