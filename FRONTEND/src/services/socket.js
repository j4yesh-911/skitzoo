import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
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

    // Authenticate user
    const token = localStorage.getItem("token");
    if (token) {
      socket.emit("authenticate", token);
    }
  }
  return socket;
};
