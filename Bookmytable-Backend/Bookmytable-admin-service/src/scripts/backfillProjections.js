import mongoose from "mongoose";
import UserReadModel from "../models/userReadModel.js";
import BrandReadModel from "../models/brandReadModel.js";
import BranchReadModel from "../models/branchReadModel.js";
import { rebuildUserProjections, rebuildBrandMetrics, rebuildBranchMetrics } from "../services/projection.service.js";

export const runBackfill = async () => {
  console.log("🚀 Starting Read Model Projections Backfill...");

  try {
    // 1. Backfill Branches
    console.log("⏳ Backfilling Branch Metrics...");
    const branches = await BranchReadModel.find({}, "_id").lean();
    for (const branch of branches) {
      await rebuildBranchMetrics(branch._id);
    }
    console.log(`✅ Backfilled ${branches.length} branches.`);

    // 2. Backfill Brands
    console.log("⏳ Backfilling Brand Metrics...");
    const brands = await BrandReadModel.find({}, "_id").lean();
    for (const brand of brands) {
      await rebuildBrandMetrics(brand._id);
    }
    console.log(`✅ Backfilled ${brands.length} brands.`);

    // 3. Backfill Users
    console.log("⏳ Backfilling User Projections...");
    const users = await UserReadModel.find({}, "_id").lean();
    for (const user of users) {
      await rebuildUserProjections(user._id);
    }
    console.log(`✅ Backfilled ${users.length} users.`);

    console.log("🎉 All Read Model Projections Backfilled Successfully!");
  } catch (error) {
    console.error("❌ Backfill failed:", error);
  }
};

// If run directly
if (process.argv[1] && process.argv[1].endsWith("backfillProjections.js")) {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookmytable-admin";
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log("Connected to MongoDB for backfill");
      await runBackfill();
      process.exit(0);
    })
    .catch(err => {
      console.error("Failed to connect to MongoDB", err);
      process.exit(1);
    });
}
