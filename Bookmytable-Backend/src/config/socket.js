import { Server } from "socket.io";
import crypto from "crypto";
import Redis from "ioredis";
import { env } from "./env.js";

let io = null;
const INSTANCE_ID = crypto.randomUUID();
const PUBSUB_CHANNEL = "bmt:socket_events";

let pubClient = null;
let subClient = null;
let isPubSubActive = false;

/**
 * Initialize Redis Pub/Sub for cross-instance event broadcasting across Vercel Functions
 */
const initRedisPubSub = () => {
  if (!env.REDIS_URL) {
    console.log("ℹ️ [Socket.IO PubSub] REDIS_URL not configured. Operating in single-instance in-memory mode.");
    return;
  }

  try {
    pubClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 1000, 3000);
      },
    });

    subClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 1000, 3000);
      },
    });

    pubClient.on("error", (err) => {
      console.warn("⚠️ [Redis PubClient]:", err.message);
    });

    subClient.on("error", (err) => {
      console.warn("⚠️ [Redis SubClient]:", err.message);
    });

    subClient.on("message", (channel, message) => {
      if (channel !== PUBSUB_CHANNEL) return;
      try {
        const { room, event, payload, senderInstanceId } = JSON.parse(message);
        // Only deliver if originating from another Vercel Function instance
        if (senderInstanceId !== INSTANCE_ID && io) {
          if (room) {
            io.to(room).emit(event, payload);
          } else {
            io.emit(event, payload);
          }
          console.log(`📡 [Cross-Instance Inbound] Event '${event}' delivered to room '${room}' from instance ${senderInstanceId.slice(0, 8)}`);
        }
      } catch (err) {
        console.warn("⚠️ [Socket PubSub Parse Error]:", err.message);
      }
    });

    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        subClient.subscribe(PUBSUB_CHANNEL, (err) => {
          if (err) {
            console.warn("⚠️ [Socket PubSub Subscribe Error]:", err.message);
          } else {
            isPubSubActive = true;
            console.log(`✅ [Socket.IO PubSub] Cross-instance event synchronization ACTIVE on channel '${PUBSUB_CHANNEL}' (Instance: ${INSTANCE_ID.slice(0, 8)})`);
          }
        });
      })
      .catch((err) => {
        console.warn("⚠️ [Socket.IO PubSub] Could not connect to Redis. Falling back to local in-memory rooms:", err.message);
      });
  } catch (err) {
    console.warn("⚠️ [Socket.IO PubSub] Init error:", err.message);
  }
};

/**
 * Publish event across all Vercel instances via Redis Pub/Sub
 */
export const broadcastCrossInstance = (room, event, payload) => {
  if (!isPubSubActive || !pubClient || pubClient.status !== "ready") return;
  try {
    const msg = JSON.stringify({
      room,
      event,
      payload,
      senderInstanceId: INSTANCE_ID,
      timestamp: Date.now(),
    });
    pubClient.publish(PUBSUB_CHANNEL, msg).catch((err) => {
      console.warn("⚠️ [Socket PubSub Publish Error]:", err.message);
    });
  } catch (err) {
    console.warn("⚠️ [Socket PubSub Broadcast Error]:", err.message);
  }
};

/**
 * Initialize Socket.IO Server with CORS, WebSocket transport, and room resolver
 */
export const initSocket = (server) => {
  if (io) return io;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    env.WEB_URL,
    env.ADMIN_URL,
    process.env.FRONTEND_URL,
    process.env.ADMIN_FRONTEND_URL,
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/cross-origin
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Start cross-instance Redis synchronization
  initRedisPubSub();

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id} (Transport: ${socket.conn.transport.name})`);

    // Handle room subscription with canonical alias resolution (Branch ID <-> Discovery ID <-> Slug)
    socket.on("join_restaurant", async (restaurantId) => {
      if (!restaurantId) return;
      const cleanId = String(restaurantId).trim();

      // 1. Join requested room immediately
      socket.join(`restaurant_${cleanId}`);
      console.log(`🔌 [Socket ${socket.id}] Joined room: restaurant_${cleanId}`);

      // 2. Resolve aliases so client receives events whether emitted by BranchId, DiscoveryId, or Slug
      try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
        if (isObjectId) {
          const { default: DiscoveryRestaurant } = await import("../models/discovery.model.js");
          const disc = await DiscoveryRestaurant.findOne({
            $or: [{ _id: cleanId }, { restaurantId: cleanId }],
          }).select("_id restaurantId slug").lean();

          if (disc) {
            const branchRoom = `restaurant_${disc.restaurantId}`;
            const discRoom = `restaurant_${disc._id}`;
            const slugRoom = disc.slug ? `restaurant_${disc.slug}` : null;

            socket.join(branchRoom);
            socket.join(discRoom);
            if (slugRoom) socket.join(slugRoom);
            console.log(`🔌 [Socket ${socket.id}] Joined canonical rooms: ${branchRoom}, ${discRoom}${slugRoom ? ', ' + slugRoom : ''}`);
          }
        }
      } catch (err) {
        // Non-blocking alias lookup
      }
    });

    socket.on("leave_restaurant", (restaurantId) => {
      if (!restaurantId) return;
      const cleanId = String(restaurantId).trim();
      socket.leave(`restaurant_${cleanId}`);
      console.log(`🔌 [Socket ${socket.id}] Left room: restaurant_${cleanId}`);
    });

    socket.on("join_user", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`🔌 [Socket ${socket.id}] Joined user room: user_${userId}`);
      }
    });

    socket.on("join_admin", (adminId) => {
      if (adminId) {
        socket.join(`admin_${adminId}`);
        socket.join("admin_global");
        console.log(`🔌 [Socket ${socket.id}] Joined admin room: admin_${adminId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

export const getIO = () => {
  return io;
};

/**
 * Emit table availability change to connected clients viewing the restaurant
 * Synchronizes: table lock created, released, expired, and booking confirmed
 * Safe: only broadcasts table IDs, date, time, and new status (held / available / booked)
 */
export const emitTableAvailabilityChanged = ({ restaurantId, date, time, tableIds, status }) => {
  if (!restaurantId) return;

  const payload = {
    restaurantId: String(restaurantId),
    date,
    time,
    tableIds: Array.isArray(tableIds) ? tableIds.map(String) : [String(tableIds)],
    status, // "held" | "available" | "booked"
    timestamp: new Date().toISOString(),
  };

  const room = `restaurant_${restaurantId}`;

  // 1. Local in-memory broadcast
  if (io) {
    io.to(room).emit("table:availability_changed", payload);
    console.log(`📡 [Socket Local] table:availability_changed emitted to ${room}:`, payload);
  }

  // 2. Cross-instance Redis broadcast
  broadcastCrossInstance(room, "table:availability_changed", payload);
};

/**
 * Emit booking confirmation to restaurant and customer rooms
 */
export const emitBookingConfirmed = ({ restaurantId, userId, booking }) => {
  const safeBooking = {
    _id: booking._id,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    status: booking.status,
    tablePrice: booking.tablePrice,
    grandTotal: booking.grandTotal,
    tables: booking.tables,
    createdAt: booking.createdAt,
  };

  if (restaurantId) {
    const room = `restaurant_${restaurantId}`;
    if (io) io.to(room).emit("booking:confirmed", safeBooking);
    broadcastCrossInstance(room, "booking:confirmed", safeBooking);
  }

  if (userId) {
    const room = `user_${userId}`;
    if (io) io.to(room).emit("booking:confirmed", safeBooking);
    broadcastCrossInstance(room, "booking:confirmed", safeBooking);
  }
};

/**
 * Emit booking cancellation to restaurant and customer rooms
 */
export const emitBookingCancelled = ({ restaurantId, userId, bookingId, tableIds, date, time }) => {
  const payload = { bookingId, tableIds, date, time, status: "cancelled" };

  if (restaurantId) {
    const room = `restaurant_${restaurantId}`;
    if (io) io.to(room).emit("booking:cancelled", payload);
    broadcastCrossInstance(room, "booking:cancelled", payload);
  }

  if (userId) {
    const room = `user_${userId}`;
    if (io) io.to(room).emit("booking:cancelled", payload);
    broadcastCrossInstance(room, "booking:cancelled", payload);
  }
};

/**
 * Emit booking created / payment pending
 */
export const emitBookingCreated = ({ restaurantId, userId, booking }) => {
  const safeBooking = {
    _id: booking._id,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    status: booking.status,
    createdAt: booking.createdAt,
  };

  if (restaurantId) {
    const room = `restaurant_${restaurantId}`;
    if (io) io.to(room).emit("booking:created", safeBooking);
    broadcastCrossInstance(room, "booking:created", safeBooking);
  }

  if (userId) {
    const room = `user_${userId}`;
    if (io) io.to(room).emit("booking:created", safeBooking);
    broadcastCrossInstance(room, "booking:created", safeBooking);
  }
};
