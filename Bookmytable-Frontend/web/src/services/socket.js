import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(socketUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
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
  connectSocket();
  socket.emit("join_restaurant", String(restaurantId));
};

export const leaveRestaurantRoom = (restaurantId) => {
  if (!restaurantId) return;
  if (socket.connected) {
    socket.emit("leave_restaurant", String(restaurantId));
  }
};