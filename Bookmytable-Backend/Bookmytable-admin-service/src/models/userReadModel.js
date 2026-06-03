import mongoose from "mongoose";

const userReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Map to original userId
    name: { type: String },
    email: { type: String },
    roles: [{ type: String }],
    status: { type: String },
    isBlocked: { type: Boolean, default: false },
    avatar: { type: String },
    phone: { type: String },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    bookingsCount: { type: Number, default: 0 },
    totalMemberships: { type: Number, default: 0 },
    ownedRestaurants: [
      {
        id: { type: String },
        name: { type: String },
        status: { type: String },
      }
    ],
    staffAffiliations: [
      {
        branchId: { type: String },
        branchName: { type: String },
        role: { type: String },
        status: { type: String },
      }
    ],
    activityLogs: [
      {
        action: { type: String },
        ip: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    createdAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userReadSchema.index({ email: 1 });
userReadSchema.index({ name: 1 });
userReadSchema.index({ isActive: 1 });
userReadSchema.index({ role: 1 });
userReadSchema.index({ createdAt: -1 });



const UserReadModel = mongoose.model("UserReadModel", userReadSchema);
export default UserReadModel;
