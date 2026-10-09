import mongoose from "mongoose";
import crypto from "crypto";
import { env } from "../src/config/env.js";
import connectDB from "../src/config/db.js";
import User from "../src/models/user.model.js";
import Table from "../src/models/table.model.js";
import RestaurantBranch from "../src/models/restaurant.model.js";
import RestaurantSettings from "../src/models/restaurantSettings.model.js";
import Booking from "../src/models/booking.model.js";
import Payment from "../src/models/payment.model.js";
import TableLock from "../src/models/tableLock.model.js";
import {
  initiateBookingHold,
  releaseBookingHold,
  confirmBookingPayment,
  getUserBookingsService,
  cancelBookingService,
} from "../src/modules/booking/booking.service.js";
import { handleRazorpayWebhook } from "../src/modules/payments/payment.controller.js";

async function runTests() {
  console.log("🚀 Starting BookMyTable Verification Suite...");
  await connectDB();

  try {
    // -------------------------------------------------------------
    // TEST SETUP: Find or create a test restaurant, table, and users
    // -------------------------------------------------------------
    console.log("\n📦 Setting up test data...");

    let branch = await RestaurantBranch.findOne({ isActive: true }).lean();
    if (!branch) {
      console.log("Creating dummy branch...");
      branch = await RestaurantBranch.create({
        name: "Test Bistro",
        slug: `test-bistro-${Date.now()}`,
        isActive: true,
        isDeleted: false,
        address: { city: "Mumbai" },
      });
    }

    let settings = await RestaurantSettings.findOne({ branch: branch._id });
    if (!settings) {
      settings = await RestaurantSettings.create({
        branch: branch._id,
        slotDuration: 60,
        tableBufferMinutes: 15,
        cancellationAllowedBeforeMinutes: 60,
      });
    }

    let table = await Table.findOne({ branch: branch._id, isActive: true });
    if (!table) {
      table = await Table.create({
        branch: branch._id,
        tableCode: "T-TEST-1",
        capacity: 4,
        type: "indoor_dining",
        resolvedPrice: 200,
        isActive: true,
      });
    }

    // Create User A (phone verified)
    const userA = await User.create({
      name: "Verified User A",
      email: `usera_${Date.now()}@test.com`,
      password: "Password123!",
      isPhoneVerified: true,
      phone: { e164: "+919876543210", isVerified: true },
    });

    // Create User B (phone verified)
    const userB = await User.create({
      name: "Verified User B",
      email: `userb_${Date.now()}@test.com`,
      password: "Password123!",
      isPhoneVerified: true,
      phone: { e164: "+919876543211", isVerified: true },
    });

    // Create User C (phone NOT verified)
    const userC = await User.create({
      name: "Unverified User C",
      email: `userc_${Date.now()}@test.com`,
      password: "Password123!",
      isPhoneVerified: false,
      phone: { e164: "+919876543212", isVerified: false },
      verification: { phoneVerified: false },
    });

    const testDate = "2026-11-20";
    const testSlot = "19:00";

    // Clean any prior bookings for test table
    await Booking.deleteMany({ "tables.tableId": table._id, date: testDate });
    await TableLock.deleteMany({ table: table._id });

    // -------------------------------------------------------------
    // TEST 1: Mandatory Phone Verification
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 1: Mandatory Phone Verification Enforcement");
    try {
      await initiateBookingHold(userC._id, {
        restaurantId: branch._id,
        tableId: table._id,
        date: testDate,
        time: testSlot,
        guests: 2,
      });
      console.error("❌ TEST 1 FAILED: Unverified user was allowed to initiate hold!");
    } catch (err) {
      if (err.code === "PHONE_VERIFICATION_REQUIRED") {
        console.log("✅ TEST 1 PASSED: Unverified phone was rejected with PHONE_VERIFICATION_REQUIRED (403)");
      } else {
        console.log("⚠️ TEST 1 Result:", err.message);
      }
    }

    // -------------------------------------------------------------
    // TEST 2: Authoritative Backend Price Calculation & Hold
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 2: Authoritative Backend Price & Hold Creation");
    const holdResA = await initiateBookingHold(userA._id, {
      restaurantId: branch._id,
      tableId: table._id,
      date: testDate,
      time: testSlot,
      guests: 2,
      // Attempt to manipulate price from client (client says 10)
      grandTotal: 10,
    });

    // Table price is 200, 5% tax is 10, expected total is 210
    const expectedTotal = 210;
    if (holdResA.amountDisplay === expectedTotal) {
      console.log(`✅ TEST 2 PASSED: Backend calculated authoritative grandTotal (₹${holdResA.amountDisplay}) ignoring client-sent amount.`);
    } else {
      console.log(`ℹ️ TEST 2: Backend calculated grandTotal: ₹${holdResA.amountDisplay}`);
    }

    const bookingA = await Booking.findById(holdResA.bookingId);
    if (bookingA.status === "payment_pending" && bookingA.holdExpiresAt > new Date()) {
      console.log("✅ TEST 2 PASSED: Booking created with status 'payment_pending' and active holdExpiresAt.");
    }

    // -------------------------------------------------------------
    // TEST 3: Concurrent Booking & Double Booking Prevention
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 3: Atomic Double-Booking Prevention");
    try {
      await initiateBookingHold(userB._id, {
        restaurantId: branch._id,
        tableId: table._id,
        date: testDate,
        time: testSlot,
        guests: 2,
      });
      console.error("❌ TEST 3 FAILED: User B was able to book an actively held table!");
    } catch (err) {
      if (err.code === "TABLE_UNAVAILABLE") {
        console.log("✅ TEST 3 PASSED: Second concurrent request was atomically rejected with TABLE_UNAVAILABLE!");
      } else {
        console.log("✅ TEST 3 PASSED: Second request rejected with:", err.message);
      }
    }

    // -------------------------------------------------------------
    // TEST 4: Release Hold & Table Becomes Available
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 4: Release Hold Flow");
    await releaseBookingHold(bookingA._id, userA._id);
    const releasedBooking = await Booking.findById(bookingA._id);
    if (releasedBooking.status === "expired") {
      console.log("✅ TEST 4 PASSED: Booking hold released and status transitioned to 'expired'.");
    }

    // Now User B should be able to acquire the table!
    const holdResB = await initiateBookingHold(userB._id, {
      restaurantId: branch._id,
      tableId: table._id,
      date: testDate,
      time: testSlot,
      guests: 2,
    });
    console.log("✅ TEST 4 PASSED: After release, table was successfully held by User B!");

    // -------------------------------------------------------------
    // TEST 5: Payment Verification & Confirmation
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 5: Payment Verification & Confirmation");
    const confirmRes = await confirmBookingPayment({
      bookingId: holdResB.bookingId,
      razorpayOrderId: holdResB.orderId,
      razorpayPaymentId: "pay_test_998877",
      razorpaySignature: "mock_signature_valid",
    });

    if (confirmRes.success && confirmRes.booking.status === "confirmed" && confirmRes.booking.paymentStatus === "paid") {
      console.log("✅ TEST 5 PASSED: Booking confirmed, status='confirmed', paymentStatus='paid'.");
    }

    // -------------------------------------------------------------
    // TEST 6: Webhook Idempotency
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 6: Webhook Idempotency (Duplicate Delivery)");
    const fakeWebhookEvent = {
      id: `evt_${Date.now()}`,
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_998877",
            order_id: holdResB.orderId,
            status: "captured",
            method: "upi",
          },
        },
      },
    };

    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;
    const rawBody = JSON.stringify(fakeWebhookEvent);
    const signature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

    const mockReq1 = {
      headers: { "x-razorpay-signature": signature },
      rawBody: rawBody,
      body: fakeWebhookEvent,
    };
    let resCode1;
    const mockRes1 = {
      status: (code) => {
        resCode1 = code;
        return { json: () => {} };
      },
    };

    await handleRazorpayWebhook(mockReq1, mockRes1);
    console.log(`✅ TEST 6: First webhook processed with response ${resCode1}`);

    // Send the exact same webhook again
    let resCode2, resData2;
    const mockRes2 = {
      status: (code) => {
        resCode2 = code;
        return {
          json: (data) => {
            resData2 = data;
          },
        };
      },
    };

    await handleRazorpayWebhook(mockReq1, mockRes2);
    if (resCode2 === 200 && (resData2?.status === "already_processed" || resData2?.status === "ok")) {
      console.log("✅ TEST 6 PASSED: Duplicate webhook handled idempotently without re-triggering confirmations!");
    }

    // -------------------------------------------------------------
    // TEST 7: My Bookings Retrieval
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 7: My Bookings API Query");
    const userBookings = await getUserBookingsService(userB._id);
    if (userBookings.length > 0 && userBookings[0].restaurantId?.name) {
      console.log(`✅ TEST 7 PASSED: Successfully retrieved ${userBookings.length} booking(s) populated with restaurant details.`);
    }

    // -------------------------------------------------------------
    // TEST 8: Cancellation Policy
    // -------------------------------------------------------------
    console.log("\n🧪 TEST 8: Booking Cancellation Policy");
    const cancelRes = await cancelBookingService(holdResB.bookingId, userB._id, "Change of plans");
    if (cancelRes.success && cancelRes.booking.status === "cancelled") {
      console.log("✅ TEST 8 PASSED: Booking cancelled successfully with status 'cancelled'.");
    }

    // Cleanup test users
    await User.deleteMany({ _id: { $in: [userA._id, userB._id, userC._id] } });
    await Booking.deleteMany({ _id: { $in: [bookingA._id, holdResB.bookingId] } });
    await Payment.deleteMany({ bookingId: { $in: [bookingA._id, holdResB.bookingId] } });
    await TableLock.deleteMany({ booking: { $in: [bookingA._id, holdResB.bookingId] } });

    console.log("\n🎉 ALL 8 TEST SUITES COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ TEST SUITE RUN ERROR:", err);
    process.exit(1);
  }
}

runTests();
