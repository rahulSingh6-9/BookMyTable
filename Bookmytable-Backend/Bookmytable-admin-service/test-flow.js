import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { emitRestaurantAdminCommand } from "./src/kafka/index.js";
import { producer } from "./src/kafka/config/kafka.js";
import BranchReadModel from "./src/models/branchReadModel.js";
import { connectDB } from "./src/config/db.js";

const runTests = async () => {
    try {
        await connectDB();
        await producer.connect();
        const branch = await BranchReadModel.findOne({}).lean();
        
        if (!branch) {
            console.error("No branch found to test.");
            process.exit(1);
        }

        const restaurantId = branch._id.toString();
        const adminContext = { id: "test-admin", role: "ADMIN", permissions: [] };

        console.log(`[Flow 1] Emitting APPROVE_RESTAURANT for ${restaurantId}`);
        await emitRestaurantAdminCommand({
            action: "APPROVE_RESTAURANT",
            payload: { id: restaurantId },
            adminContext
        });

        await new Promise(r => setTimeout(r, 2000));

        console.log(`[Flow 2] Emitting REJECT_RESTAURANT for ${restaurantId}`);
        await emitRestaurantAdminCommand({
            action: "REJECT_RESTAURANT",
            payload: { id: restaurantId },
            adminContext
        });

        await new Promise(r => setTimeout(r, 2000));

        console.log(`[Flow 3] Emitting SUSPEND_RESTAURANT for ${restaurantId}`);
        await emitRestaurantAdminCommand({
            action: "SUSPEND_RESTAURANT",
            payload: { id: restaurantId },
            adminContext
        });

        await new Promise(r => setTimeout(r, 2000));
        console.log("Finished emitting commands.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTests();
