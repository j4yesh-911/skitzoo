import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    const BASE_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";

    socket = io(BASE_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
    });

    // Authenticate AFTER connection
    socket.on("connect", () => {
      const token = localStorage.getItem("token");
      if (token) {
        socket.emit("authenticate", token);
      }
    });
  }
  return socket;
};