import mongoose from "mongoose";

const branchReadSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    brandId: { type: String, ref: "BrandReadModel" },
    branchName: { type: String },
    branchSlug: { type: String, index: true },
    branchCode: { type: String },
    status: { type: String, default: "pending" },
    city: { type: String },
    address: { type: String },
    fullAddress: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      area: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      postalCode: { type: String },
      landmark: { type: String },
    },
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number] }
    },
    contactNumber: { type: String },
    logo: { type: String },
    coverImage: { type: String },
    brandName: { type: String },
    cuisineTypes: [{ type: String }],
    description: { type: String },
    email: { type: String },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    reservationPhone: { type: String },
    whatsappNumber: { type: String },
    managerName: { type: String },
    managerPhone: { type: String },
    googleMapsLink: { type: String },
    tablesCount: { type: Number, default: 0 },
    
    tableStats: {
      totalTables: { type: Number, default: 0 },
      availableTables: { type: Number, default: 0 },
      occupiedTables: { type: Number, default: 0 },
      reservedTables: { type: Number, default: 0 },
      inactiveTables: { type: Number, default: 0 },
      totalFloors: { type: Number, default: 0 },
      totalSections: { type: Number, default: 0 },
      hasTables: { type: Boolean, default: false },
      lastUpdated: { type: Date },
    },

    staffCount: { type: Number, default: 0 },
    bookingsEnabled: { type: Boolean, default: false },
    autoApproveBookings: { type: Boolean, default: false },
    bookingsCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    
    menuStats: {
      totalItems: { type: Number, default: 0 },
      totalCategories: { type: Number, default: 0 },
      featuredItems: { type: Number, default: 0 },
      vegCount: { type: Number, default: 0 },
      nonVegCount: { type: Number, default: 0 },
      availableItems: { type: Number, default: 0 },
      hasMenu: { type: Boolean, default: false },
      lastUpdated: { type: Date },
    },

    bookingPolicySummary: {
      bookingEnabled: { type: Boolean, default: false },
      minGuests: { type: Number, default: 1 },
      maxGuests: { type: Number, default: 10 },
      advanceBookingDays: { type: Number, default: 7 },
      reservationBuffer: { type: Number, default: 15 },
      instantBookingEnabled: { type: Boolean, default: true },
      lastPolicyUpdatedAt: { type: Date }
    },
    
    availabilitySummary: {
      isOpenNow: { type: Boolean, default: false },
      todayOpeningTime: { type: String, default: null },
      todayClosingTime: { type: String, default: null },
      weeklyAvailabilitySummary: { type: String, default: null },
      acceptingReservations: { type: Boolean, default: false },
      hasExceptions: { type: Boolean, default: false },
      slotDuration: { type: Number, default: 60 },
      availabilityUpdatedAt: { type: Date }
    },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    discoveryRanking: { type: Number, default: 0 },
    isHiddenFromDiscovery: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    suspendedAt: { type: Date },
    deletedAt: { type: Date },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BranchReadModel = mongoose.model("BranchReadModel", branchReadSchema);
export default BranchReadModel;
