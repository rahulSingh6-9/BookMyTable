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
console.log("🔌 [Admin Socket] Initializing connection to:", socketUrl);

export const socket = io(socketUrl, {
  autoConnect: false, // Don't connect until login
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  transports: ["websocket"], // Use WebSocket directly to prevent 404 polling errors on Vercel
  timeout: 15000,
});

socket.on("connect", () => {
  console.log(`🔌 [Admin Socket] Connected successfully (ID: ${socket.id}, Transport: ${socket.io?.engine?.transport?.name})`);
});

socket.on("disconnect", (reason) => {
  console.log("❌ [Admin Socket] Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.warn("⚠️ [Admin Socket] Connection error:", err.message);
});
