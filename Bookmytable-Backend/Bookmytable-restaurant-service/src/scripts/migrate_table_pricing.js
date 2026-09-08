import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import Table from "../models/table.model.js";
import DiningAreaPricing from "../models/diningAreaPricing.model.js";

async function runMigration() {
  console.log("🚀 Starting Table Pricing Migration...\n");

  try {
    // 1. Connect DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // 2. Find legacy tables
    const tables = await Table.find({
      $or: [
        { priceSource: "none" },
        { priceSource: { $exists: false } },
        { resolvedPrice: 0 },
        { resolvedPrice: { $exists: false } }
      ],
      isActive: true,
      isDeleted: false
    });

    console.log(`🔍 Found ${tables.length} tables requiring pricing migration.\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const table of tables) {
      // 3. Look up pricing
      const pricingConfig = await DiningAreaPricing.findOne({
        branch: table.branch,
        floor: table.floor,
        diningAreaType: table.type,
        sectionType: table.section
      });

      if (pricingConfig && pricingConfig.price !== undefined && pricingConfig.price !== null) {
        table.priceSource = "dining_area_pricing";
        table.resolvedPrice = pricingConfig.price;
        await table.save();
        
        console.log(`✅ Fixed Table ${table.tableCode} (${table.section}, ${table.floor}) -> ₹${pricingConfig.price}`);
        successCount++;
      } else {
        console.log(`❌ Failed Table ${table.tableCode} (${table.section}, ${table.floor}): No matching DiningAreaPricing found.`);
        failureCount++;
      }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`🟢 Successfully Migrated: ${successCount}`);
    console.log(`🔴 Failed / Missing Config: ${failureCount}\n`);

  } catch (error) {
    console.error("💥 Migration Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

runMigration();
