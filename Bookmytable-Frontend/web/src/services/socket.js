import { io } from "socket.io-client";

/**
 * Dynamically resolve the backend Socket.IO URL
 * Supports VITE_SOCKET_URL, VITE_API_URL stripping, or Vercel production fallback
 */
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return "https://book-my-table-server-two.vercel.app";
  }
  return "http://localhost:5000";
};

const socketUrl = getSocketUrl();
console.log("🔌 [Socket Client] Initializing connection to:", socketUrl);

export const socket = io(socketUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket", "polling"],
  timeout: 15000,
});

// Set of rooms the client is currently listening to
const activeRooms = new Set();

// Resubscribe to all active rooms on initial connect and on every reconnect
socket.on("connect", () => {
  console.log(`🔌 [Socket Client] Connected successfully (ID: ${socket.id}, Transport: ${socket.io?.engine?.transport?.name})`);
  activeRooms.forEach((roomId) => {
    socket.emit("join_restaurant", roomId);
    console.log(`🔌 [Socket Client] Auto-resubscribed to room: restaurant_${roomId}`);
  });
});

socket.on("disconnect", (reason) => {
  console.log("❌ [Socket Client] Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ [Socket Client] Connection error:", err.message);
});

export const connectSocket = () => {
  if (!socket.connected) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  }
  return socket;
};

export const joinRestaurantRoom = (restaurantId) => {
  if (!restaurantId) return;
  const cleanId = String(restaurantId).trim();
  activeRooms.add(cleanId);
  connectSocket();
  if (socket.connected) {
    socket.emit("join_restaurant", cleanId);
    console.log(`🔌 [Socket Client] Emitted join_restaurant: ${cleanId}`);
  }
};

export const leaveRestaurantRoom = (restaurantId) => {
  if (!restaurantId) return;
  const cleanId = String(restaurantId).trim();
  activeRooms.delete(cleanId);
  if (socket.connected) {
    socket.emit("leave_restaurant", cleanId);
    console.log(`🔌 [Socket Client] Emitted leave_restaurant: ${cleanId}`);
  }
};
