import Brand from '../../models/brand.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import Restaurant from '../../models/restaurant.model.js';
import cloudinary from '../../config/cloudinary.js';
import { 
  emitBrandDeactivated, 
  emitBrandArchived, 
  emitBrandRestored, 
  emitBrandPartialUpdate, 
  publishEvent 
} from '../../kafka/index.js';
import { RESTAURANT_TOPICS } from "../../kafka/topics/restaurant.topics.js";
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createLog } from '../log/log.service.js';
import crypto from 'crypto';

/**
 * Check if a user is authorized to manage the brand
 */
export const isAuthorizedToManageBrand = async (userId, brandId) => {
  const brand = await Brand.findById(brandId);
  if (!brand) return { authorized: false, brand: null };

  const ownerId = brand.ownerId || brand.createdBy;
  if (ownerId && ownerId.toString() === userId.toString()) {
    return { authorized: true, brand };
  }

  const membership = await BranchMembership.findOne({
    user: userId,
    brand: brandId,
    status: "active",
    role: { $in: ["owner", "co_owner", "manager"] }
  });

  if (membership) {
    return { authorized: true, brand };
  }

  return { authorized: false, brand };
};

/**
 * Helper to verify password
 */
export const verifyUserPassword = async (userId, password) => {
  const dbUser = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
  if (!dbUser || !dbUser.password) return false;
  return await bcrypt.compare(password, dbUser.password);
};

export const getBrandsForUser = async (userId) => {
  const ownedBrands = await Brand.find({ ownerId: userId, isDeleted: { $ne: true } });
  const ownedBrandIds = ownedBrands.map(b => b._id.toString());

  const memberships = await BranchMembership.find({
    user: userId,
    status: "active",
    role: { $in: ["owner", "co_owner", "manager"] }
  }).select("brand");

  const membershipBrandIds = memberships
    .map(m => m.brand?.toString())
    .filter(id => id && !ownedBrandIds.includes(id));

  const allBrandIds = [...ownedBrandIds, ...membershipBrandIds];

  if (allBrandIds.length === 0) return [];

  const brands = await Brand.find({ _id: { $in: allBrandIds }, isDeleted: { $ne: true } });

  const branchCounts = await Restaurant.aggregate([
    { $match: { brandId: { $in: brands.map(b => b._id) }, isDeleted: { $ne: true } } },
    { $group: { _id: "$brandId", count: { $sum: 1 } } }
  ]);

  const countMap = {};
  branchCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

  return brands.map(brand => ({
    _id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || "",
    branchCount: countMap[brand._id.toString()] || 0
  }));
};

export const getArchivedBrandsForUser = async (userId) => {
  const ownedBrands = await Brand.find({ ownerId: userId, isDeleted: true });
  const ownedBrandIds = ownedBrands.map(b => b._id.toString());

  const memberships = await BranchMembership.find({
    user: userId,
    status: "active",
    role: { $in: ["owner", "co_owner", "manager"] }
  }).select("brand");

  const membershipBrandIds = memberships
    .map(m => m.brand?.toString())
    .filter(id => id && !ownedBrandIds.includes(id));

  const allBrandIds = [...ownedBrandIds, ...membershipBrandIds];

  if (allBrandIds.length === 0) return [];

  const brands = await Brand.find({ _id: { $in: allBrandIds }, isDeleted: true });

  return brands.map(brand => ({
    _id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    logo: brand.logo || "",
    deletedAt: brand.deletedAt
  }));
};

export const updateLogo = async (userId, brandId, fileBuffer, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied: You do not have permission to manage this brand.");

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "bookmytable/brands" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });

  const logoUrl = uploadResult.secure_url;
  brand.logo = logoUrl;
  brand.updatedBy = userId;
  await brand.save();

  await Restaurant.updateMany(
    { brandId, isDeleted: { $ne: true } },
    { $set: { logo: logoUrl } }
  );

  await createLog({
    entityType: "brand",
    brandId: brand._id,
    entityId: brand._id,
    action: "BRAND_UPDATED",
    performedBy: userId,
    metadata: { field: "logo" },
  });

  try {
    await emitBrandPartialUpdate(brand._id, { logo: logoUrl });
  } catch (kafkaError) {
    console.error("⚠️ Kafka event emission failed for brand logo update:", kafkaError.message);
  }

  return logoUrl;
};

export const deactivate = async (userId, brandId, reason, password, notifyMembers = true, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  if (brand.isDeleted) throw new Error("Cannot deactivate an archived brand");

  brand.isActive = false;
  brand.updatedBy = userId;
  await brand.save();

  await Restaurant.updateMany(
    { brandId, isDeleted: { $ne: true }, isActive: true },
    { $set: { isActive: false, deactivatedViaBrand: true } }
  );

  await createLog({
    entityType: "brand",
    brandId: brand._id,
    entityId: brand._id,
    action: "BRAND_DEACTIVATED",
    performedBy: userId,
    metadata: { reason },
  });

  try {
    await emitBrandDeactivated(brand, null, { reason, actorId: userId, notifyMembers });
  } catch (kafkaError) {}

  return brand;
};

export const archive = async (userId, brandId, reason, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  brand.isDeleted = true;
  brand.deletedAt = new Date();
  brand.isActive = false;
  brand.updatedBy = userId;
  await brand.save();

  await Restaurant.updateMany(
    { brandId, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date(), isActive: false, archivedViaBrand: true } }
  );

  await createLog({
    entityType: "brand",
    brandId: brand._id,
    entityId: brand._id,
    action: "BRAND_ARCHIVED",
    performedBy: userId,
    metadata: { reason: reason || "User requested archive" },
  });

  try {
    await emitBrandArchived(brand);
  } catch (kafkaError) {}

  return brand;
};

export const restore = async (userId, brandId, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  brand.isDeleted = false;
  brand.deletedAt = null;
  brand.isActive = true;
  brand.updatedBy = userId;
  await brand.save();

  await Restaurant.updateMany(
    { brandId, $or: [{ archivedViaBrand: true }, { deactivatedViaBrand: true }] },
    { $set: { isDeleted: false, deletedAt: null, isActive: true, archivedViaBrand: false, deactivatedViaBrand: false } }
  );

  await createLog({
    entityType: "brand",
    brandId: brand._id,
    entityId: brand._id,
    action: "BRAND_RESTORED",
    performedBy: userId,
    metadata: { reason: "User requested restore" },
  });

  try {
    await emitBrandRestored(brand);
  } catch (kafkaError) {}

  return brand;
};

export const updateBasicContact = async (userId, brandId, { website, supportEmail, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  if (website !== undefined) brand.website = website;
  if (supportEmail !== undefined) brand.supportEmail = supportEmail;
  brand.updatedBy = userId;
  await brand.save();

  await createLog({
    entityType: "brand",
    brandId: brand._id,
    entityId: brand._id,
    action: "CONTACT_INFO_UPDATED",
    performedBy: userId,
    metadata: { fieldsUpdated: ["website", "supportEmail"] },
  });

  try {
    await emitBrandPartialUpdate(brand._id, { website: brand.website, supportEmail: brand.supportEmail }, null, userId);
  } catch (kafkaError) {}

  return brand;
};

export const requestPhoneOTP = async (userId, brandId, { contactPhone, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  
  await mongoose.connection.db.collection('verificationtokens').updateOne(
    { phone: contactPhone },
    { $set: { phone: contactPhone, token: hashedOtp, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60000), createdAt: new Date() } },
    { upsert: true }
  );

  await publishEvent({
    topic: 'auth.phone.otp.requested',
    eventType: 'phone.otp.requested',
    data: { phone: contactPhone, otp }
  });
};

export const verifyPhoneOTP = async (userId, brandId, { contactPhone, otp }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  const tokenDoc = await mongoose.connection.db.collection('verificationtokens').findOne({ phone: contactPhone });
  if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
    throw new Error("OTP expired or invalid");
  }
  if (tokenDoc.attempts >= 5) {
    await mongoose.connection.db.collection('verificationtokens').deleteOne({ phone: contactPhone });
    throw new Error("Too many attempts");
  }

  const isValid = await bcrypt.compare(otp.toString(), tokenDoc.token);
  if (!isValid) {
    await mongoose.connection.db.collection('verificationtokens').updateOne({ phone: contactPhone }, { $inc: { attempts: 1 } });
    throw new Error("Invalid OTP");
  }

  await mongoose.connection.db.collection('verificationtokens').deleteOne({ phone: contactPhone });

  brand.contactPhone = contactPhone;
  brand.contactPhoneVerified = true;
  brand.updatedBy = userId;
  await brand.save();

  await createLog({ entityType: "brand", brandId: brand._id, entityId: brand._id, action: "CONTACT_PHONE_UPDATED", performedBy: userId, metadata: { contactPhone } });
  try { await emitBrandPartialUpdate(brand._id, { contactPhone: brand.contactPhone }, null, userId); } catch (e) {}

  return brand;
};

export const requestEmailUpdate = async (userId, brandId, { contactEmail, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const tokenId = crypto.randomUUID().substring(0, 8);
  brand.pendingContactEmail = { email: contactEmail, tokenId, expiresAt: new Date(Date.now() + 2 * 3600000) };
  await brand.save();

  await publishEvent({
    topic: RESTAURANT_TOPICS.NOTIFICATION_EMAIL_SEND,
    eventType: "notification.email.send",
    data: {
      template: "BRAND_EMAIL_VERIFICATION",
      recipient: contactEmail,
      variables: { verificationToken: tokenId, brandName: brand.name },
      brandId: brand._id,
      timestamp: Date.now()
    }
  });
};

export const verifyEmailToken = async (userId, brandId, { token }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, brand } = await isAuthorizedToManageBrand(userId, brandId);
  
  if (!brand) throw new Error("Brand not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!brand.pendingContactEmail || !brand.pendingContactEmail.tokenId) {
    throw new Error("No pending verification found");
  }
  if (brand.pendingContactEmail.tokenId !== token) {
    throw new Error("Invalid verification token");
  }
  if (brand.pendingContactEmail.expiresAt < new Date()) {
    brand.pendingContactEmail = undefined;
    await brand.save();
    throw new Error("Token expired");
  }

  brand.contactEmail = brand.pendingContactEmail.email;
  brand.contactEmailVerified = true;
  brand.pendingContactEmail = undefined;
  brand.updatedBy = userId;
  await brand.save();

  await createLog({ entityType: "brand", brandId: brand._id, entityId: brand._id, action: "CONTACT_EMAIL_UPDATED", performedBy: userId, metadata: { contactEmail: brand.contactEmail } });
  try { await emitBrandPartialUpdate(brand._id, { contactEmail: brand.contactEmail }, null, userId); } catch (e) {}

  return brand;
};
