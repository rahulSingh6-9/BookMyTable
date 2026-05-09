import mongoose from "mongoose";

const userReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Map to original userId
    name: { type: String },
    email: { type: String },
    roles: [{ type: String }],
    status: { type: String },
    isBlocked: { type: Boolean, default: false },
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
