import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import DiningAreaPricing from '../../models/diningAreaPricing.model.js';
import { createLog } from '../log/log.service.js';

/**
 * Helper to verify password from the users collection
 */
export const verifyUserPassword = async (userId, password) => {
  const dbUser = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
  if (!dbUser || !dbUser.password) return false;
  return await bcrypt.compare(password, dbUser.password);
};

export const getPricingConfig = async (branchId) => {
  const pricing = await DiningAreaPricing.find({ branch: branchId });
  return pricing;
};

export const updatePricingConfig = async (userId, branchId, { floor, diningAreaType, sectionType, price, password }) => {
  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const updatedConfig = await DiningAreaPricing.findOneAndUpdate(
    { branch: branchId, floor, diningAreaType, sectionType },
    { $set: { price, updatedBy: userId }, $setOnInsert: { createdBy: userId } },
    { new: true, upsert: true }
  );

  await createLog({
    entityType: "branch",
    branchId: branchId,
    entityId: updatedConfig._id,
    action: "PRICING_UPDATED",
    performedBy: userId,
    metadata: { floor, diningAreaType, sectionType, price },
  });

  return updatedConfig;
};

export const validatePasswordOnly = async (userId, password) => {
  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }
  return true;
};

export const deletePricingConfig = async (userId, branchId, pricingId, password) => {
  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const pricing = await DiningAreaPricing.findOneAndDelete({ _id: pricingId, branch: branchId });
  if (!pricing) {
    throw new Error("Pricing not found");
  }

  await createLog({
    entityType: "branch",
    branchId: branchId,
    entityId: pricing._id,
    action: "PRICING_DELETED",
    performedBy: userId,
    metadata: { floor: pricing.floor, diningAreaType: pricing.diningAreaType, sectionType: pricing.sectionType, price: pricing.price },
  });

  return true;
};
