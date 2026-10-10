import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const socket = io(socketUrl, {
  autoConnect: false, // Don't connect until login
  reconnection: true,
  reconnectionAttempts: 5,
});