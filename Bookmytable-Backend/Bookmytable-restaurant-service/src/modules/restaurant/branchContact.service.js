import RestaurantBranch from '../../models/restaurant.model.js';
import Brand from '../../models/brand.model.js';
import BranchMembership from '../../models/branchmemberships.model.js';
import { publishEvent, emitRestaurantPartialUpdate } from '../../kafka/index.js';
import { RESTAURANT_TOPICS } from "../../kafka/topics/restaurant.topics.js";
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { createLog } from '../log/log.service.js';
import crypto from 'crypto';

/**
 * Check if user is authorized to manage the branch
 */
export const isAuthorizedToManageBranch = async (userId, branchId) => {
  const branch = await RestaurantBranch.findById(branchId);
  if (!branch) return { authorized: false, branch: null, brand: null };

  const brand = await Brand.findById(branch.brandId);

  // Check if owner
  if (branch.ownerId && branch.ownerId.toString() === userId.toString()) {
    return { authorized: true, branch, brand };
  }

  if (brand && brand.ownerId && brand.ownerId.toString() === userId.toString()) {
    return { authorized: true, branch, brand };
  }

  // Check branch membership
  const membership = await BranchMembership.findOne({
    user: userId,
    branch: branchId,
    status: "active",
    role: { $in: ["owner", "co_owner", "manager"] }
  });

  if (membership) {
    return { authorized: true, branch, brand };
  }

  // Check brand membership
  const brandMembership = await BranchMembership.findOne({
    user: userId,
    brand: branch.brandId,
    status: "active",
    role: { $in: ["owner", "co_owner"] }
  });

  if (brandMembership) {
    return { authorized: true, branch, brand };
  }

  return { authorized: false, branch, brand };
};

/**
 * Helper to verify password
 */
export const verifyUserPassword = async (userId, password) => {
  const dbUser = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(userId) });
  if (!dbUser || !dbUser.password) return false;
  return await bcrypt.compare(password, dbUser.password);
};

export const updateBranchBasicContact = async (userId, branchId, { reservationPhone, whatsappNumber, managerName, managerPhone, googleMapsLink, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  if (!branch.contact) branch.contact = {};
  if (!branch.contact.secondaryPhone) branch.contact.secondaryPhone = {};

  const delta = {};

  if (reservationPhone !== undefined) {
    branch.contact.secondaryPhone.number = reservationPhone;
    delta['contact.secondaryPhone.number'] = reservationPhone;
  }
  if (whatsappNumber !== undefined) {
    branch.contact.whatsappNumber = whatsappNumber;
    delta['contact.whatsappNumber'] = whatsappNumber;
  }
  if (managerName !== undefined) {
    branch.contact.managerName = managerName;
    delta['contact.managerName'] = managerName;
  }
  if (managerPhone !== undefined) {
    branch.contact.managerPhone = managerPhone;
    delta['contact.managerPhone'] = managerPhone;
  }
  if (googleMapsLink !== undefined) {
    branch.contact.googleMapsLink = googleMapsLink;
    delta['contact.googleMapsLink'] = googleMapsLink;
  }

  branch.updatedBy = userId;
  await branch.save();

  await createLog({
    entityType: "branch",
    brandId: branch.brandId,
    entityId: branch._id,
    action: "CONTACT_INFO_UPDATED",
    performedBy: userId,
    metadata: { fieldsUpdated: Object.keys(delta) },
  });

  try {
    await emitRestaurantPartialUpdate(branch._id, branch.brandId, delta, null, userId);
  } catch (error) {
    console.error("Kafka Sync Error:", error);
  }

  return branch;
};

export const requestBranchPhoneOTP = async (userId, branchId, { contactPhone, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
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

export const verifyBranchPhoneOTP = async (userId, branchId, { contactPhone, otp }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
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

  if (!branch.contact) branch.contact = {};
  if (!branch.contact.primaryPhone) branch.contact.primaryPhone = {};

  branch.contact.primaryPhone.number = contactPhone;
  branch.contact.primaryPhone.isVerified = true;
  branch.updatedBy = userId;
  await branch.save();

  await createLog({ entityType: "branch", brandId: branch.brandId, entityId: branch._id, action: "CONTACT_PHONE_UPDATED", performedBy: userId, metadata: { contactPhone } });
  
  try { 
    await emitRestaurantPartialUpdate(branch._id, branch.brandId, { 'contact.primaryPhone.number': contactPhone, 'contact.primaryPhone.isVerified': true }, null, userId); 
  } catch (e) {
    console.error("Kafka sync error", e);
  }

  return branch;
};

export const requestBranchEmailUpdate = async (userId, branchId, { contactEmail, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const tokenId = crypto.randomUUID().substring(0, 8);
  if (!branch.contact) branch.contact = {};
  branch.contact.pendingContactEmail = { email: contactEmail, tokenId, expiresAt: new Date(Date.now() + 2 * 3600000) };
  await branch.save();

  await publishEvent({
    topic: RESTAURANT_TOPICS.NOTIFICATION_EMAIL_SEND,
    eventType: "notification.email.send",
    data: {
      template: "BRAND_EMAIL_VERIFICATION", // Reusing brand template for branch is okay here
      recipient: contactEmail,
      variables: { verificationToken: tokenId, brandName: branch.branchName },
      brandId: branch.brandId,
      branchId: branch._id,
      timestamp: Date.now()
    }
  });
};

export const verifyBranchEmailToken = async (userId, branchId, { token }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!branch.contact || !branch.contact.pendingContactEmail || !branch.contact.pendingContactEmail.tokenId) {
    throw new Error("No pending verification found");
  }
  if (branch.contact.pendingContactEmail.tokenId !== token) {
    throw new Error("Invalid verification token");
  }
  if (branch.contact.pendingContactEmail.expiresAt < new Date()) {
    branch.contact.pendingContactEmail = undefined;
    await branch.save();
    throw new Error("Token expired");
  }

  branch.contact.email = branch.contact.pendingContactEmail.email;
  branch.contact.isEmailVerified = true;
  branch.contact.pendingContactEmail = undefined;
  branch.updatedBy = userId;
  await branch.save();

  await createLog({ entityType: "branch", brandId: branch.brandId, entityId: branch._id, action: "CONTACT_EMAIL_UPDATED", performedBy: userId, metadata: { contactEmail: branch.contact.email } });
  
  try { 
    await emitRestaurantPartialUpdate(branch._id, branch.brandId, { 'contact.email': branch.contact.email, 'contact.isEmailVerified': true }, null, userId); 
  } catch (e) {
    console.error("Kafka sync error", e);
  }

  return branch;
};

export const updateBranchLocation = async (userId, branchId, { addressLine1, addressLine2, city, state, country, pincode, landmark, lat, lng, password }, globalRoles = []) => {
  const isPlatformAdmin = globalRoles.includes("admin") || globalRoles.includes("super_admin");
  const { authorized, branch, brand } = await isAuthorizedToManageBranch(userId, branchId);
  
  if (!branch) throw new Error("Branch not found");
  if (!authorized && !isPlatformAdmin) throw new Error("Access Denied");

  if (!(await verifyUserPassword(userId, password))) {
    throw new Error("Invalid password");
  }

  const oldAddress = branch.address ? { ...branch.address } : null;
  const oldLocation = branch.location ? { ...branch.location } : null;

  if (!branch.address) branch.address = {};
  
  branch.address.addressLine1 = addressLine1;
  branch.address.addressLine2 = addressLine2;
  branch.address.city = city;
  branch.address.state = state;
  branch.address.country = country;
  branch.address.postalCode = pincode;
  branch.address.landmark = landmark;

  branch.location = {
    type: "Point",
    coordinates: [parseFloat(lng), parseFloat(lat)]
  };

  branch.updatedBy = userId;
  await branch.save();

  const delta = {
    address: branch.address,
    location: branch.location
  };

  // Branch Log
  await createLog({ 
    entityType: "branch", 
    brandId: branch.brandId, 
    entityId: branch._id, 
    action: "LOCATION_UPDATED", 
    performedBy: userId, 
    metadata: { oldAddress, oldLocation, newAddress: branch.address, newLocation: branch.location } 
  });

  // Brand Log
  await createLog({ 
    entityType: "brand", 
    brandId: branch.brandId, 
    entityId: branch.brandId, 
    action: "BRANCH_LOCATION_CHANGED", 
    performedBy: userId, 
    metadata: { branchId: branch._id, branchName: branch.branchName } 
  });

  // CQRS Sync
  try {
    await emitRestaurantPartialUpdate(branch._id, branch.brandId, delta, null, userId);
  } catch (error) {
    console.error("Kafka Sync Error on location update:", error);
  }

  // Email Notifications
  try {
    const timeStr = new Date().toLocaleString();
    const recipients = [];
    if (branch.contact?.email) recipients.push(branch.contact.email);
    if (brand?.contactEmail) recipients.push(brand.contactEmail);

    for (const recipient of [...new Set(recipients)]) {
      await publishEvent({
        topic: RESTAURANT_TOPICS.NOTIFICATION_EMAIL_SEND,
        eventType: "notification.email.send",
        data: {
          template: "GENERIC_NOTIFICATION", // Adjust if a specific location template exists
          recipient,
          variables: { 
            subject: `Location Updated for ${branch.branchName}`,
            title: "Branch Location Changed",
            message: `The location for your branch "${branch.branchName}" has been successfully updated.`,
            details: `New Address: ${addressLine1}, ${city}, ${country}\nTime of change: ${timeStr}`
          },
          brandId: branch.brandId,
          branchId: branch._id,
          timestamp: Date.now()
        }
      });
    }
  } catch (error) {
    console.error("Email notification Error on location update:", error);
  }

  return branch;
};
