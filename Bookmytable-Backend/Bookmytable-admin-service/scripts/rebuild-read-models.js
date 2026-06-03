import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isDryRun = process.argv.includes('--dry');
console.log(`\n=== READ MODEL REBUILD SYSTEM ===`);
if (isDryRun) {
  console.log(`⚠️  RUNNING IN DRY RUN MODE (No DB writes will occur)`);
} else {
  console.log(`🚀 RUNNING IN LIVE MODE`);
}

async function run() {
  try {
    // Force 127.0.0.1 to avoid Docker internal proxy issues and IPv6 localhost resolution mismatch on Windows
    const mongoUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/';
    
    // Connect default mongoose to Admin DB (where Read Models live)
    await mongoose.connect(mongoUri, { dbName: 'bookmytable-admin' });
    console.log(`✅ Connected to Admin DB: bookmytable-admin`);

    // Create a separate connection for Core DB (where Source data lives)
    const coreConn = await mongoose.createConnection(mongoUri, { dbName: 'bookmytable' }).asPromise();
    console.log(`✅ Connected to Core DB: bookmytable`);

    // Target Read Models (Same Package, same mongoose instance)
    const UserReadModel = (await import('../src/models/userReadModel.js')).default;
    const BrandReadModel = (await import('../src/models/brandReadModel.js')).default;
    const BranchReadModel = (await import('../src/models/branchReadModel.js')).default;
    const RestaurantReadModel = (await import('../src/models/restaurantReadModel.js')).default;
    const MembershipReadModel = (await import('../src/models/membershipReadModel.js')).default;
    const SubscriptionPlanReadModel = (await import('../src/models/subscriptionPlanReadModel.js')).default;
    const BrandSubscriptionReadModel = (await import('../src/models/brandSubscriptionReadModel.js')).default;
    const InvitationReadModel = (await import('../src/models/invitationReadModel.js')).default;
    
    // Orchestrator: Order matters!
    await syncUsers(coreConn, UserReadModel);
    await syncBrands(coreConn, BrandReadModel);
    await syncBranches(coreConn, BranchReadModel, RestaurantReadModel);
    await syncMemberships(coreConn, MembershipReadModel);
    await syncSubscriptions(coreConn, SubscriptionPlanReadModel, BrandSubscriptionReadModel);
    await syncInvitations(coreConn, InvitationReadModel);
    await syncDiscovery(coreConn);

    console.log(`\n🎉 REBUILD COMPLETE.`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Fatal Error:`, error);
    process.exit(1);
  }
}

// ----------------------------------------------------
// 1. USERS
// ----------------------------------------------------
async function syncUsers(coreConn, Target) {
  console.log(`\n--- Syncing Users ---`);
  let count = 0;
  const cursor = coreConn.collection('users').find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const payload = {
      _id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      roles: doc.roles,
      isBlocked: doc.isBlocked,
      avatar: doc.avatar,
      phone: typeof doc.phone === 'string' ? doc.phone : (doc.phone?.e164 || doc.phone?.number || null),
      emailVerified: doc.isEmailVerified,
      phoneVerified: false,
      lastLogin: doc.lastLogin,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && count === 0) console.log('Sample User Payload:', payload);
    if (!isDryRun) {
      await Target.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    count++;
  }
  console.log(`Processed ${count} Users.`);
}

// ----------------------------------------------------
// 2. BRANDS
// ----------------------------------------------------
async function syncBrands(coreConn, Target) {
  console.log(`\n--- Syncing Brands ---`);
  let count = 0;
  const cursor = coreConn.collection('brands').find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const payload = {
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      ownerId: doc.ownerId?.toString(),
      status: doc.status,
      logo: doc.logo || "",
      description: doc.description || "",
      isActive: doc.isActive,
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && count === 0) console.log('Sample Brand Payload:', payload);
    if (!isDryRun) {
      await Target.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    count++;
  }
  console.log(`Processed ${count} Brands.`);
}

// ----------------------------------------------------
// 3. BRANCHES
// ----------------------------------------------------
async function syncBranches(coreConn, TargetBranch, TargetRestaurant) {
  console.log(`\n--- Syncing Branches ---`);
  let count = 0;
  const cursor = coreConn.collection('restaurantbranches').find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const payload = {
      _id: doc._id.toString(),
      brandId: doc.brandId?.toString(),
      branchName: doc.branchName,
      branchCode: doc.branchCode,
      status: doc.status,
      phoneVerified: doc.contact?.primaryPhone?.isVerified || false,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      suspendedAt: doc.suspendedAt,
      logo: doc.logo || "",
      coverImage: doc.coverImage || "",
      images: doc.images || [],
      city: doc.address?.city,
      address: doc.address?.addressLine1,
      isActive: doc.isActive,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && count === 0) console.log('Sample Branch Payload:', payload);
    if (!isDryRun) {
      await TargetBranch.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
      await TargetRestaurant.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    count++;
  }
  console.log(`Processed ${count} Branches.`);
}

// ----------------------------------------------------
// 4. MEMBERSHIPS
// ----------------------------------------------------
async function syncMemberships(coreConn, Target) {
  console.log(`\n--- Syncing Memberships ---`);
  let count = 0;
  const cursor = coreConn.collection('branchmemberships').find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const payload = {
      _id: doc._id.toString(),
      userId: doc.user?.toString() || doc.userId?.toString(),
      branchId: doc.branch?.toString() || doc.branchId?.toString(),
      brandId: doc.brand?.toString() || doc.brandId?.toString(),
      role: doc.role,
      status: doc.status,
      joinedAt: doc.joinedAt || new Date(),
      employeeId: doc.employeeId,
      designation: doc.designation,
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && count === 0) console.log('Sample Membership Payload:', payload);
    if (!isDryRun) {
      await Target.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    count++;
  }
  console.log(`Processed ${count} Memberships.`);
}

// ----------------------------------------------------
// 5. SUBSCRIPTIONS
// ----------------------------------------------------
async function syncSubscriptions(coreConn, PlanTarget, SubTarget) {
  console.log(`\n--- Syncing Subscription Plans ---`);
  let planCount = 0;
  const pCursor = coreConn.collection('subscriptionplans').find({});
  while (await pCursor.hasNext()) {
    const doc = await pCursor.next();
    const payload = {
      _id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      pricing: doc.pricing,
      limits: doc.limits,
      features: doc.features,
      isTrialPlan: doc.isTrialPlan,
      trialDays: doc.trialDays,
      isActive: doc.isActive,
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && planCount === 0) console.log('Sample Plan Payload:', payload);
    if (!isDryRun) {
      await PlanTarget.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    planCount++;
  }
  console.log(`Processed ${planCount} Subscription Plans.`);

  console.log(`\n--- Syncing Brand Subscriptions ---`);
  let subCount = 0;
  const sCursor = coreConn.collection('brandsubscriptions').find({});
  while (await sCursor.hasNext()) {
    const doc = await sCursor.next();
    const payload = {
      _id: doc._id.toString(),
      brandId: doc.brandId?.toString(),
      subscriptionPlanId: doc.subscriptionPlanId?.toString(),
      status: doc.status,
      billingCycle: doc.billingCycle,
      startedAt: doc.startedAt,
      expiresAt: doc.expiresAt,
      trialEndsAt: doc.trialEndsAt,
      autoRenew: doc.autoRenew,
      paymentProvider: doc.paymentProvider,
      paymentReference: doc.paymentReference,
      createdBy: doc.createdBy?.toString(),
      lastPaymentAt: doc.lastPaymentAt,
      cancelledAt: doc.cancelledAt,
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && subCount === 0) console.log('Sample Sub Payload:', payload);
    if (!isDryRun) {
      await SubTarget.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    subCount++;
  }
  console.log(`Processed ${subCount} Brand Subscriptions.`);
}

// ----------------------------------------------------
// 6. INVITATIONS
// ----------------------------------------------------
async function syncInvitations(coreConn, Target) {
  console.log(`\n--- Syncing Invitations ---`);
  let count = 0;
  const cursor = coreConn.collection('staffinvites').find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const payload = {
      _id: doc._id.toString(),
      branchId: doc.branch?.toString() || doc.branchId?.toString(),
      brandId: doc.brand?.toString() || doc.brandId?.toString(),
      invitedBy: doc.invitedBy?.toString(),
      email: doc.email,
      phone: typeof doc.phone === 'string' ? doc.phone : (doc.phone?.e164 || doc.phone?.number || null),
      role: doc.role,
      status: doc.status,
      token: doc.token,
      expiresAt: doc.expiresAt,
      acceptedAt: doc.acceptedAt,
      acceptedBy: doc.acceptedBy?.toString(),
      updatedAt: doc.updatedAt || new Date()
    };
    if (isDryRun && count === 0) console.log('Sample Invitation Payload:', payload);
    if (!isDryRun) {
      await Target.findOneAndUpdate({ _id: payload._id }, { $set: payload }, { upsert: true, returnDocument: 'after' });
    }
    count++;
  }
  console.log(`Processed ${count} Invitations.`);
}

// ----------------------------------------------------
// 7. DISCOVERY
// ----------------------------------------------------
async function syncDiscovery(coreConn) {
  console.log(`\n--- Syncing Discovery Projections ---`);
  let count = 0;
  // Only approved and active branches go to discovery
  const cursor = coreConn.collection('restaurantbranches').find({ status: 'approved', isActive: true, isDeleted: false });
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    // Requires lat/lng to be present, but we will safely map it
    if (!doc.address?.city) continue;

    const payload = {
      restaurantId: doc._id.toString(),
      brandId: doc.brandId?.toString(),
      name: doc.branchName || doc.restaurantName || "Unknown",
      slug: doc.branchCode || doc._id.toString(),
      description: doc.description || "",
      city: doc.address?.city,
      area: doc.address?.area || doc.address?.city,
      addressLine1: doc.address?.addressLine1 || "",
      location: {
        type: "Point",
        coordinates: doc.location?.coordinates?.length === 2 ? doc.location.coordinates : [77.5946, 12.9716] // fallback to BLR for safety if missing
      },
      cuisines: doc.cuisineTypes || [],
      tags: [],
      averageRating: doc.averageRating || 0,
      totalReviews: doc.totalReviews || 0,
      logo: doc.logo,
      coverImage: doc.coverImage,
      phone: doc.contact?.primaryPhone?.number,
      costForTwo: doc.costForTwo || 500,
      status: doc.status,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      updatedAt: new Date()
    };
    if (isDryRun && count === 0) console.log('Sample Discovery Payload:', payload);
    if (!isDryRun) {
      await mongoose.connection.collection('discoveryrestaurants').findOneAndUpdate(
        { restaurantId: new mongoose.Types.ObjectId(payload.restaurantId) }, 
        { $set: payload }, 
        { upsert: true, returnDocument: 'after' }
      );
    }
    count++;
  }
  console.log(`Processed ${count} Discovery Restaurants.`);
}

run();
