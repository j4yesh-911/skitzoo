// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");

// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");

// const app = express();
// const server = http.createServer(app);

// // ================= DB =================
// connectDB();

// // ================= MIDDLEWARE =================
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(express.static(path.join(__dirname, "..")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
//   setHeaders: (res, path) => {
//     if (path.endsWith('.wav')) {
//       res.setHeader('Content-Type', 'audio/wav');
//     } else if (path.endsWith('.webm')) {
//       res.setHeader('Content-Type', 'audio/webm');
//     } else if (path.endsWith('.mp4')) {
//       res.setHeader('Content-Type', 'audio/mp4');
//     } else if (path.endsWith('.mp3')) {
//       res.setHeader('Content-Type', 'audio/mpeg');
//     }
//   }
// }));

// // ================= ROUTES =================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);

// // ================= SOCKET =================
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   // -------- AUTH --------
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       console.log("✅ Socket authenticated:", socket.userId);
//       // Notify others that this user is now online
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   // -------- JOIN CHAT --------
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;
//     socket.join(chatId);

//     // Reset unread count safely
//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });

//     // Mark messages as seen
//     const unseen = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (unseen.length) {
//       await Message.updateMany(
//         { _id: { $in: unseen.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: unseen.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // -------- TYPING --------
//   socket.on("typing", async ({ chatId }) => {
//     if (!socket.userId) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $addToSet: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("typing", {
//       chatId,
//       userId: socket.userId,
//     });

//     setTimeout(async () => {
//       await Chat.findByIdAndUpdate(chatId, {
//         $pull: { typingUsers: socket.userId },
//       });
//     }, 3000);
//   });

//   socket.on("stopTyping", async ({ chatId }) => {
//     if (!socket.userId) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $pull: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("stopTyping", {
//       chatId,
//       userId: socket.userId,
//     });
//   });

//   // -------- SEND MESSAGE --------
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     const senderId = socket.userId;

//     const messageData = {
//       chatId,
//       sender: senderId,
//       type: type || "text",
//       status: "sent",
//     };

//     if (type === "voice") {
//       messageData.audioUrl = audioUrl;
//     } else {
//       messageData.text = text;
//     }

//     const message = await Message.create(messageData);

//     // update lastSeen for sender and notify presence (active now)
//     await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });
//     io.emit("userOnline", { userId: senderId });

//     const chat = await Chat.findById(chatId).select("members");
//     const receiverId = chat.members.find(
//       (m) => m.toString() !== senderId
//     );

//     // Increment unread safely
//     await Chat.findByIdAndUpdate(chatId, {
//       $inc: { [`unreadCounts.${receiverId}`]: 1 },
//       $set: {
//         lastMessage: {
//           text: type === "voice" ? "Voice message" : text,
//           sender: senderId
//         },
//         updatedAt: Date.now(),
//       },
//     });

//     // Emit to sender
//     socket.emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       status: "sent",
//       createdAt: message.createdAt,
//     });

//     // Delivered
//     await Message.findByIdAndUpdate(message._id, {
//       status: "delivered",
//     });

//     socket.emit("messageStatusUpdate", {
//       chatId,
//       messageId: message._id.toString(),
//       status: "delivered",
//     });

//     // Emit to receiver
//     socket.to(chatId).emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       createdAt: message.createdAt,
//     });
//   });

//   // -------- DISCONNECT (presence) --------
//   socket.on("disconnect", async (reason) => {
//     if (!socket.userId) return;
//     try {
//       const lastSeen = new Date();
//       await User.findByIdAndUpdate(socket.userId, { lastSeen });
//       io.emit("userOffline", { userId: socket.userId, lastSeen });
//       console.log("🔌 Socket disconnected and lastSeen updated:", socket.userId);
//     } catch (err) {
//       console.error("Error updating lastSeen on disconnect:", err);
//     }
//   });

//   // -------- MARK SEEN --------
//   socket.on("markMessagesAsSeen", async ({ chatId }) => {
//     if (!socket.userId) return;

//     const msgs = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (msgs.length) {
//       await Message.updateMany(
//         { _id: { $in: msgs.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: msgs.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // -------- UNSEND --------
//   socket.on("unsendMessage", async ({ chatId, messageId }) => {
//     const msg = await Message.findById(messageId);
//     if (!msg || msg.sender.toString() !== socket.userId) return;

//     msg.isDeleted = true;
//     msg.deletedAt = new Date();
//     await msg.save();

//     io.to(chatId).emit("messageDeleted", {
//       chatId,
//       messageId,
//       isDeleted: true,
//     });
//   });

//   // -------- WEBRTC --------
//   socket.on("webrtcOffer", ({ chatId, offer }) =>
//     socket.to(chatId).emit("webrtcOffer", offer)
//   );
//   socket.on("webrtcAnswer", ({ chatId, answer }) =>
//     socket.to(chatId).emit("webrtcAnswer", answer)
//   );
//   socket.on("iceCandidate", ({ chatId, candidate }) =>
//     socket.to(chatId).emit("iceCandidate", candidate)
//   );
//   socket.on("callEnd", ({ chatId }) =>
//     socket.to(chatId).emit("callEnd")
//   );
//   socket.on("callDeclined", ({ chatId }) =>
//     socket.to(chatId).emit("callDeclined")
//   );
// });

// // ================= START SERVER =================
// server.listen(5000, () => {
//   console.log("🚀 Backend running on http://localhost:5000");
// });

// module.exports = { io };

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const connectDB = require("./config/db");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");
// const reportRoutes = require("./routes/reportRoutes"); // 🔴 REPORT FEATURE

// // MODELS
// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");
// const Report = require("./models/Report"); // 🔴 REPORT FEATURE

// const app = express();
// const server = http.createServer(app);

// // ================= DB =================
// connectDB();

// // ================= MIDDLEWARE =================
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// app.use(express.static(path.join(__dirname, "..")));
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"), {
//     setHeaders: (res, path) => {
//       if (path.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
//       else if (path.endsWith(".webm")) res.setHeader("Content-Type", "audio/webm");
//       else if (path.endsWith(".mp4")) res.setHeader("Content-Type", "audio/mp4");
//       else if (path.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
//     },
//   })
// );

// // ================= ROUTES =================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/reports", reportRoutes); // 🔴 REPORT FEATURE

// // ================= SOCKET =================
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   // -------- AUTH --------
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       console.log("✅ Socket authenticated:", socket.userId);
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   // 🔴 REPORT FEATURE: shared block check
//   const isInteractionBlocked = async (chatId, senderId) => {
//     const chat = await Chat.findById(chatId).select("members");
//     if (!chat) return true;

//     const otherUserId = chat.members.find(
//       (m) => m.toString() !== senderId
//     );

//     const report = await Report.findOne({
//       $or: [
//         { reporter: senderId, reported: otherUserId },
//         { reporter: otherUserId, reported: senderId },
//       ],
//     }).lean();

//     return !!report;
//   };

//   // -------- JOIN CHAT --------
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;

//     // 🔴 REPORT FEATURE
//     if (await isInteractionBlocked(chatId, socket.userId)) return;

//     socket.join(chatId);

//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });

//     const unseen = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (unseen.length) {
//       await Message.updateMany(
//         { _id: { $in: unseen.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: unseen.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // -------- TYPING --------
//   socket.on("typing", async ({ chatId }) => {
//     if (!socket.userId) return;

//     // 🔴 REPORT FEATURE
//     if (await isInteractionBlocked(chatId, socket.userId)) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $addToSet: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("typing", {
//       chatId,
//       userId: socket.userId,
//     });

//     setTimeout(async () => {
//       await Chat.findByIdAndUpdate(chatId, {
//         $pull: { typingUsers: socket.userId },
//       });
//     }, 3000);
//   });

//   socket.on("stopTyping", async ({ chatId }) => {
//     if (!socket.userId) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $pull: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("stopTyping", {
//       chatId,
//       userId: socket.userId,
//     });
//   });

//   // -------- SEND MESSAGE --------
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     // 🔴 REPORT FEATURE
//     if (await isInteractionBlocked(chatId, socket.userId)) return;

//     const senderId = socket.userId;

//     const messageData = {
//       chatId,
//       sender: senderId,
//       type: type || "text",
//       status: "sent",
//     };

//     if (type === "voice") {
//       messageData.audioUrl = audioUrl;
//     } else {
//       messageData.text = text;
//     }

//     const message = await Message.create(messageData);

//     await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });
//     io.emit("userOnline", { userId: senderId });

//     const chat = await Chat.findById(chatId).select("members");
//     const receiverId = chat.members.find(
//       (m) => m.toString() !== senderId
//     );

//     await Chat.findByIdAndUpdate(chatId, {
//       $inc: { [`unreadCounts.${receiverId}`]: 1 },
//       $set: {
//         lastMessage: {
//           text: type === "voice" ? "Voice message" : text,
//           sender: senderId,
//         },
//         updatedAt: Date.now(),
//       },
//     });

//     socket.emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       status: "sent",
//       createdAt: message.createdAt,
//     });

//     await Message.findByIdAndUpdate(message._id, { status: "delivered" });

//     socket.emit("messageStatusUpdate", {
//       chatId,
//       messageId: message._id.toString(),
//       status: "delivered",
//     });

//     socket.to(chatId).emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       createdAt: message.createdAt,
//     });
//   });

//   // -------- DISCONNECT --------
//   socket.on("disconnect", async () => {
//     if (!socket.userId) return;
//     const lastSeen = new Date();
//     await User.findByIdAndUpdate(socket.userId, { lastSeen });
//     io.emit("userOffline", { userId: socket.userId, lastSeen });
//   });

//   // -------- MARK SEEN --------
//   socket.on("markMessagesAsSeen", async ({ chatId }) => {
//     if (!socket.userId) return;

//     const msgs = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (msgs.length) {
//       await Message.updateMany(
//         { _id: { $in: msgs.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: msgs.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // -------- UNSEND --------
//   socket.on("unsendMessage", async ({ chatId, messageId }) => {
//     const msg = await Message.findById(messageId);
//     if (!msg || msg.sender.toString() !== socket.userId) return;

//     msg.isDeleted = true;
//     msg.deletedAt = new Date();
//     await msg.save();

//     io.to(chatId).emit("messageDeleted", {
//       chatId,
//       messageId,
//       isDeleted: true,
//     });
//   });

//   // -------- WEBRTC --------
//   socket.on("webrtcOffer", async ({ chatId, offer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcOffer", offer);
//   });

//   socket.on("webrtcAnswer", async ({ chatId, answer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcAnswer", answer);
//   });

//   socket.on("iceCandidate", async ({ chatId, candidate }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("iceCandidate", candidate);
//   });

//   socket.on("callEnd", ({ chatId }) =>
//     socket.to(chatId).emit("callEnd")
//   );
//   socket.on("callDeclined", ({ chatId }) =>
//     socket.to(chatId).emit("callDeclined")
//   );
// });

// // ================= START SERVER =================
// server.listen(5000, () => {
//   console.log("🚀 Backend running on http://localhost:5000");
// });

// module.exports = { io };

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// require("dotenv").config();

// const connectDB = require("./config/db");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");
// const reportRoutes = require("./routes/reportRoutes");

// // MODELS
// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");
// const Report = require("./models/Report");

// const app = express();
// const server = http.createServer(app);

// // ================= DB =================
// connectDB();

// // ================= MIDDLEWARE =================
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // ================= MULTER CONFIG =================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "uploads"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"));
//     }
//   },
// });

// app.use(express.static(path.join(__dirname, "..")));

// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"), {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
//       else if (filePath.endsWith(".webm")) res.setHeader("Content-Type", "audio/webm");
//       else if (filePath.endsWith(".mp4")) res.setHeader("Content-Type", "audio/mp4");
//       else if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
//     },
//   })
// );

// // ================= ROUTES =================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/reports", reportRoutes);

// // ================= SOCKET =================
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   // ================= AUTH =================
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   // ================= REPORT BLOCK CHECK =================
//   const isInteractionBlocked = async (chatId, userId) => {
//     const chat = await Chat.findById(chatId).select("members");
//     if (!chat) return true;

//     const otherUserId = chat.members.find(
//       (m) => m.toString() !== userId
//     );

//     const report = await Report.findOne({
//       $or: [
//         { reporter: userId, reported: otherUserId },
//         { reporter: otherUserId, reported: userId },
//       ],
//     }).lean();

//     return !!report;
//   };

//   // ================= JOIN CHAT =================
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     socket.join(chatId);

//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });

//     const unseen = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (unseen.length) {
//       await Message.updateMany(
//         { _id: { $in: unseen.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: unseen.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // ================= TYPING =================
//   socket.on("typing", async ({ chatId }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $addToSet: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("typing", {
//       chatId,
//       userId: socket.userId,
//     });

//     setTimeout(async () => {
//       await Chat.findByIdAndUpdate(chatId, {
//         $pull: { typingUsers: socket.userId },
//       });
//     }, 3000);
//   });

//   socket.on("stopTyping", async ({ chatId }) => {
//     if (!socket.userId) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $pull: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("stopTyping", {
//       chatId,
//       userId: socket.userId,
//     });
//   });

//   // ================= SEND MESSAGE =================
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     const senderId = socket.userId;

//     const messageData = {
//       chatId,
//       sender: senderId,
//       type: type || "text",
//       status: "sent",
//     };

//     if (type === "voice") messageData.audioUrl = audioUrl;
//     else messageData.text = text;

//     const message = await Message.create(messageData);

//     await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });
//     io.emit("userOnline", { userId: senderId });

//     const chat = await Chat.findById(chatId).select("members");
//     const receiverId = chat.members.find(
//       (m) => m.toString() !== senderId
//     );

//     await Chat.findByIdAndUpdate(chatId, {
//       $inc: { [`unreadCounts.${receiverId}`]: 1 },
//       $set: {
//         lastMessage: {
//           text: type === "voice" ? "Voice message" : text,
//           sender: senderId,
//         },
//         updatedAt: Date.now(),
//       },
//     });

//     socket.emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       status: "sent",
//       createdAt: message.createdAt,
//     });

//     await Message.findByIdAndUpdate(message._id, { status: "delivered" });

//     socket.emit("messageStatusUpdate", {
//       chatId,
//       messageId: message._id.toString(),
//       status: "delivered",
//     });

//     socket.to(chatId).emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       createdAt: message.createdAt,
//     });
//   });

//   // ================= DISCONNECT =================
//   socket.on("disconnect", async () => {
//     if (!socket.userId) return;
//     const lastSeen = new Date();
//     await User.findByIdAndUpdate(socket.userId, { lastSeen });
//     io.emit("userOffline", { userId: socket.userId, lastSeen });
//   });

//   // ================= UNSEND =================
//   socket.on("unsendMessage", async ({ chatId, messageId }) => {
//     const msg = await Message.findById(messageId);
//     if (!msg || msg.sender.toString() !== socket.userId) return;

//     msg.isDeleted = true;
//     msg.deletedAt = new Date();
//     await msg.save();

//     io.to(chatId).emit("messageDeleted", {
//       chatId,
//       messageId,
//       isDeleted: true,
//     });
//   });

//   // ================= WEBRTC =================
//   socket.on("webrtcOffer", async ({ chatId, offer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcOffer", offer);
//   });

//   socket.on("webrtcAnswer", async ({ chatId, answer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcAnswer", answer);
//   });

//   socket.on("iceCandidate", async ({ chatId, candidate }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("iceCandidate", candidate);
//   });

//   socket.on("callEnd", ({ chatId }) =>
//     socket.to(chatId).emit("callEnd")
//   );

//   socket.on("callDeclined", ({ chatId }) =>
//     socket.to(chatId).emit("callDeclined")
//   );
// });

// // ================= START SERVER =================
// server.listen(5000, () => {
//   console.log("🚀 Backend running on http://localhost:5000");
// });

// module.exports = { io };

// require("dotenv").config(); // MUST be at top

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const jwt = require("jsonwebtoken");

// // DB
// const connectDB = require("./config/db");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");
// const reportRoutes = require("./routes/reportRoutes");

// // MODELS
// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");
// const Report = require("./models/Report");

// const app = express();
// const server = http.createServer(app);

// /* ================= DB ================= */
// connectDB();

// /* ================= ENSURE UPLOADS DIR ================= */
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// /* ================= MIDDLEWARE ================= */
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// /* ================= STATIC FILES ================= */
// app.use(
//   "/uploads",
//   express.static(uploadsDir, {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
//       if (filePath.endsWith(".webm")) res.setHeader("Content-Type", "audio/webm");
//       if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
//       if (filePath.endsWith(".mp4")) res.setHeader("Content-Type", "video/mp4");
//     },
//   })
// );

// /* ================= ROUTES ================= */
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/reports", reportRoutes);

// /* ================= SOCKET ================= */
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   /* ---------- AUTH ---------- */
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   /* ---------- BLOCK CHECK ---------- */
//   const isInteractionBlocked = async (chatId, userId) => {
//     const chat = await Chat.findById(chatId).select("members");
//     if (!chat) return true;

//     const otherUserId = chat.members.find(
//       (m) => m.toString() !== userId
//     );

//     const report = await Report.findOne({
//       $or: [
//         { reporter: userId, reported: otherUserId },
//         { reporter: otherUserId, reported: userId },
//       ],
//     }).lean();

//     return !!report;
//   };

//   /* ---------- JOIN CHAT ---------- */
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     socket.join(chatId);

//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });
//   });

//   /* ---------- SEND MESSAGE ---------- */
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     const message = await Message.create({
//       chatId,
//       sender: socket.userId,
//       type: type || "text",
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       status: "sent",
//     });

//     socket.to(chatId).emit("receiveMessage", message);
//     socket.emit("receiveMessage", message);
//   });

//   /* ---------- DISCONNECT ---------- */
//   socket.on("disconnect", async () => {
//     if (!socket.userId) return;
//     const lastSeen = new Date();
//     await User.findByIdAndUpdate(socket.userId, { lastSeen });
//     io.emit("userOffline", { userId: socket.userId, lastSeen });
//   });
// });

// /* ================= START SERVER ================= */
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Backend running on http://localhost:${PORT}`);
// });

// module.exports = { io };

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// require("dotenv").config();

// const connectDB = require("./config/db");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");
// const reportRoutes = require("./routes/reportRoutes");

// // MODELS
// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");
// const Report = require("./models/Report");

// const app = express();
// const server = http.createServer(app);

// // ================= DB =================
// connectDB();

// // ================= MIDDLEWARE =================
// app.use(cors());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // ================= MULTER CONFIG =================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "uploads"));
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"));
//     }
//   },
// });

// app.use(express.static(path.join(__dirname, "..")));

// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads"), {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
//       else if (filePath.endsWith(".webm")) res.setHeader("Content-Type", "audio/webm");
//       else if (filePath.endsWith(".mp4")) res.setHeader("Content-Type", "audio/mp4");
//       else if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
//     },
//   })
// );

// // ================= ROUTES =================
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/reports", reportRoutes);

// // ================= SOCKET =================
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   // ================= AUTH =================
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   // ================= REPORT BLOCK CHECK =================
//   const isInteractionBlocked = async (chatId, userId) => {
//     const chat = await Chat.findById(chatId).select("members");
//     if (!chat) return true;

//     const otherUserId = chat.members.find(
//       (m) => m.toString() !== userId
//     );

//     const report = await Report.findOne({
//       $or: [
//         { reporter: userId, reported: otherUserId },
//         { reporter: otherUserId, reported: userId },
//       ],
//     }).lean();

//     return !!report;
//   };

//   // ================= JOIN CHAT =================
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     socket.join(chatId);

//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });

//     const unseen = await Message.find({
//       chatId,
//       sender: { $ne: socket.userId },
//       status: { $ne: "seen" },
//     }).select("_id");

//     if (unseen.length) {
//       await Message.updateMany(
//         { _id: { $in: unseen.map((m) => m._id) } },
//         { status: "seen" }
//       );

//       io.to(chatId).emit("messageStatusUpdate", {
//         chatId,
//         messageIds: unseen.map((m) => m._id.toString()),
//         status: "seen",
//       });
//     }
//   });

//   // ================= TYPING =================
//   socket.on("typing", async ({ chatId }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $addToSet: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("typing", {
//       chatId,
//       userId: socket.userId,
//     });

//     setTimeout(async () => {
//       await Chat.findByIdAndUpdate(chatId, {
//         $pull: { typingUsers: socket.userId },
//       });
//     }, 3000);
//   });

//   socket.on("stopTyping", async ({ chatId }) => {
//     if (!socket.userId) return;

//     await Chat.findByIdAndUpdate(chatId, {
//       $pull: { typingUsers: socket.userId },
//     });

//     socket.to(chatId).emit("stopTyping", {
//       chatId,
//       userId: socket.userId,
//     });
//   });

//   // ================= SEND MESSAGE =================
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     const senderId = socket.userId;

//     const messageData = {
//       chatId,
//       sender: senderId,
//       type: type || "text",
//       status: "sent",
//     };

//     if (type === "voice") messageData.audioUrl = audioUrl;
//     else messageData.text = text;

//     const message = await Message.create(messageData);

//     await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });
//     io.emit("userOnline", { userId: senderId });

//     const chat = await Chat.findById(chatId).select("members");
//     const receiverId = chat.members.find(
//       (m) => m.toString() !== senderId
//     );

//     await Chat.findByIdAndUpdate(chatId, {
//       $inc: { [`unreadCounts.${receiverId}`]: 1 },
//       $set: {
//         lastMessage: {
//           text: type === "voice" ? "Voice message" : text,
//           sender: senderId,
//         },
//         updatedAt: Date.now(),
//       },
//     });

//     socket.emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       status: "sent",
//       createdAt: message.createdAt,
//     });

//     await Message.findByIdAndUpdate(message._id, { status: "delivered" });

//     socket.emit("messageStatusUpdate", {
//       chatId,
//       messageId: message._id.toString(),
//       status: "delivered",
//     });

//     socket.to(chatId).emit("receiveMessage", {
//       _id: message._id,
//       chatId,
//       sender: senderId,
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       type: type || "text",
//       createdAt: message.createdAt,
//     });
//   });

//   // ================= DISCONNECT =================
//   socket.on("disconnect", async () => {
//     if (!socket.userId) return;
//     const lastSeen = new Date();
//     await User.findByIdAndUpdate(socket.userId, { lastSeen });
//     io.emit("userOffline", { userId: socket.userId, lastSeen });
//   });

//   // ================= UNSEND =================
//   socket.on("unsendMessage", async ({ chatId, messageId }) => {
//     const msg = await Message.findById(messageId);
//     if (!msg || msg.sender.toString() !== socket.userId) return;

//     msg.isDeleted = true;
//     msg.deletedAt = new Date();
//     await msg.save();

//     io.to(chatId).emit("messageDeleted", {
//       chatId,
//       messageId,
//       isDeleted: true,
//     });
//   });

//   // ================= WEBRTC =================
//   socket.on("webrtcOffer", async ({ chatId, offer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcOffer", offer);
//   });

//   socket.on("webrtcAnswer", async ({ chatId, answer }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("webrtcAnswer", answer);
//   });

//   socket.on("iceCandidate", async ({ chatId, candidate }) => {
//     if (await isInteractionBlocked(chatId, socket.userId)) return;
//     socket.to(chatId).emit("iceCandidate", candidate);
//   });

//   socket.on("callEnd", ({ chatId }) =>
//     socket.to(chatId).emit("callEnd")
//   );

//   socket.on("callDeclined", ({ chatId }) =>
//     socket.to(chatId).emit("callDeclined")
//   );
// });

// // ================= START SERVER =================
// server.listen(5000, () => {
//   console.log("🚀 Backend running on http://localhost:5000");
// });

// module.exports = { io };

// require("dotenv").config(); // MUST be at top

// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const path = require("path");
// const fs = require("fs");
// const jwt = require("jsonwebtoken");

// // DB
// const connectDB = require("./config/db");

// // ROUTES
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const chatRoutes = require("./routes/chatRoutes");
// const messageRoutes = require("./routes/messageRoutes");
// const likeRoutes = require("./routes/likeRoutes");
// const swapRoutes = require("./routes/swapRoutes");
// const reportRoutes = require("./routes/reportRoutes");

// // MODELS
// const Message = require("./models/Message");
// const Chat = require("./models/Chat");
// const User = require("./models/User");
// const Report = require("./models/Report");

// const app = express();
// const server = http.createServer(app);

// /* ================= DB ================= */
// connectDB();

// /* ================= ENSURE UPLOADS DIR ================= */
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// /* ================= MIDDLEWARE ================= */
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// /* ================= STATIC FILES ================= */
// app.use(
//   "/uploads",
//   express.static(uploadsDir, {
//     setHeaders: (res, filePath) => {
//       if (filePath.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
//       if (filePath.endsWith(".webm")) res.setHeader("Content-Type", "audio/webm");
//       if (filePath.endsWith(".mp3")) res.setHeader("Content-Type", "audio/mpeg");
//       if (filePath.endsWith(".mp4")) res.setHeader("Content-Type", "video/mp4");
//     },
//   })
// );

// /* ================= ROUTES ================= */
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/chats", chatRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/likes", likeRoutes);
// app.use("/api/swaps", swapRoutes);
// app.use("/api/reports", reportRoutes);

// /* ================= SOCKET ================= */
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "http://localhost:5174",
//       "http://localhost:5175",
//       "http://localhost:5176",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("🔌 Socket connected:", socket.id);

//   /* ---------- AUTH ---------- */
//   socket.on("authenticate", (token) => {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       io.emit("userOnline", { userId: socket.userId });
//     } catch {
//       console.log("❌ Socket authentication failed");
//     }
//   });

//   /* ---------- BLOCK CHECK ---------- */
//   const isInteractionBlocked = async (chatId, userId) => {
//     const chat = await Chat.findById(chatId).select("members");
//     if (!chat) return true;

//     const otherUserId = chat.members.find(
//       (m) => m.toString() !== userId
//     );

//     const report = await Report.findOne({
//       $or: [
//         { reporter: userId, reported: otherUserId },
//         { reporter: otherUserId, reported: userId },
//       ],
//     }).lean();

//     return !!report;
//   };

//   /* ---------- JOIN CHAT ---------- */
//   socket.on("joinChat", async (chatId) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     socket.join(chatId);

//     await Chat.findByIdAndUpdate(chatId, {
//       $set: { [`unreadCounts.${socket.userId}`]: 0 },
//     });

//     io.to(chatId).emit("unreadCountUpdate", {
//       chatId,
//       userId: socket.userId,
//       unreadCount: 0,
//     });
//   });

//   /* ---------- SEND MESSAGE ---------- */
//   socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
//     if (!socket.userId) return;

//     if (await isInteractionBlocked(chatId, socket.userId)) {
//       socket.emit("interactionBlocked", { chatId });
//       return;
//     }

//     const message = await Message.create({
//       chatId,
//       sender: socket.userId,
//       type: type || "text",
//       text: type === "voice" ? null : text,
//       audioUrl: type === "voice" ? audioUrl : null,
//       status: "sent",
//     });

//     socket.to(chatId).emit("receiveMessage", message);
//     socket.emit("receiveMessage", message);
//   });

//   /* ---------- DISCONNECT ---------- */
//   socket.on("disconnect", async () => {
//     if (!socket.userId) return;
//     const lastSeen = new Date();
//     await User.findByIdAndUpdate(socket.userId, { lastSeen });
//     io.emit("userOffline", { userId: socket.userId, lastSeen });
//   });
// });

// /* ================= START SERVER ================= */
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Backend running on http://localhost:${PORT}`);
// });

// module.exports = { io };

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");

// DB
const connectDB = require("./config/db");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const likeRoutes = require("./routes/likeRoutes");
const swapRoutes = require("./routes/swapRoutes");
const reportRoutes = require("./routes/reportRoutes");
const postRoutes = require("./routes/postRoutes");
const aiRoutes = require("./routes/aiRoutes");

// MODELS
const Message = require("./models/Message");
const Chat = require("./models/Chat");
const User = require("./models/User");
const Report = require("./models/Report");

const app = express();
const server = http.createServer(app);

/* ================= DB ================= */
connectDB();

/* ================= CORS ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
    "https://skitzoo.vercel.app",
  process.env.FRONTEND_URL, // ✅ production
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ================= STATIC ================= */
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".wav")) res.setHeader("Content-Type", "audio/wav");
      else if (filePath.endsWith(".webm"))
        res.setHeader("Content-Type", "audio/webm");
      else if (filePath.endsWith(".mp3"))
        res.setHeader("Content-Type", "audio/mpeg");
    },
  })
);

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chats", chatRoutes); // keep both (your logic)
app.use("/api/messages", messageRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/swaps", swapRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);

/* ================= SOCKET ================= */
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://skitzoo.vercel.app", // ✅ ADD THIS
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  /* ---------- AUTH ---------- */
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      io.emit("userOnline", { userId: socket.userId });
    } catch {
      console.log("❌ Socket authentication failed");
    }
  });

  /* ---------- BLOCK CHECK ---------- */
  const isInteractionBlocked = async (chatId, userId) => {
    const chat = await Chat.findById(chatId).select("members");
    if (!chat) return true;

    const otherUserId = chat.members.find((m) => m.toString() !== userId);

    const report = await Report.findOne({
      $or: [
        { reporter: userId, reported: otherUserId },
        { reporter: otherUserId, reported: userId },
      ],
    }).lean();

    return !!report;
  };

  /* ---------- JOIN CHAT ---------- */
  socket.on("joinChat", async (chatId) => {
    if (!socket.userId) return;

    if (await isInteractionBlocked(chatId, socket.userId)) {
      socket.emit("interactionBlocked", { chatId });
      return;
    }

    socket.join(chatId);

    await Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCounts.${socket.userId}`]: 0 },
    });

    io.to(chatId).emit("unreadCountUpdate", {
      chatId,
      userId: socket.userId,
      unreadCount: 0,
    });

    const unseen = await Message.find({
      chatId,
      sender: { $ne: socket.userId },
      status: { $ne: "seen" },
    }).select("_id");

    if (unseen.length) {
      await Message.updateMany(
        { _id: { $in: unseen.map((m) => m._id) } },
        { status: "seen" }
      );

      io.to(chatId).emit("messageStatusUpdate", {
        chatId,
        messageIds: unseen.map((m) => m._id.toString()),
        status: "seen",
      });
    }
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", async ({ chatId }) => {
    if (!socket.userId) return;
    if (await isInteractionBlocked(chatId, socket.userId)) return;

    await Chat.findByIdAndUpdate(chatId, {
      $addToSet: { typingUsers: socket.userId },
    });

    socket.to(chatId).emit("typing", { chatId, userId: socket.userId });

    setTimeout(async () => {
      await Chat.findByIdAndUpdate(chatId, {
        $pull: { typingUsers: socket.userId },
      });
    }, 3000);
  });

  socket.on("stopTyping", async ({ chatId }) => {
    if (!socket.userId) return;

    await Chat.findByIdAndUpdate(chatId, {
      $pull: { typingUsers: socket.userId },
    });

    socket.to(chatId).emit("stopTyping", {
      chatId,
      userId: socket.userId,
    });
  });

  /* ---------- SEND MESSAGE ---------- */
  socket.on("sendMessage", async ({ chatId, text, type, audioUrl }) => {
    if (!socket.userId) return;

    if (await isInteractionBlocked(chatId, socket.userId)) {
      socket.emit("interactionBlocked", { chatId });
      return;
    }

    const senderId = socket.userId;

    const messageData = {
      chatId,
      sender: senderId,
      type: type || "text",
      status: "sent",
    };

    if (type === "voice") {
      if (audioUrl && audioUrl.includes(":\\")) return;
      messageData.audioUrl = audioUrl;
    } else {
      messageData.text = text;
    }

    const message = await Message.create(messageData);

    await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });
    io.emit("userOnline", { userId: senderId });

    const chat = await Chat.findById(chatId).select("members");
    const receiverId = chat.members.find((m) => m.toString() !== senderId);

    await Chat.findByIdAndUpdate(chatId, {
      $inc: { [`unreadCounts.${receiverId}`]: 1 },
      $set: {
        lastMessage: {
          text: type === "voice" ? "Voice message" : text,
          sender: senderId,
        },
        updatedAt: Date.now(),
      },
    });

    socket.emit("receiveMessage", message);

    await Message.findByIdAndUpdate(message._id, {
      status: "delivered",
    });

    socket.emit("messageStatusUpdate", {
      chatId,
      messageId: message._id.toString(),
      status: "delivered",
    });

    socket.to(chatId).emit("receiveMessage", message);
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", async () => {
    if (!socket.userId) return;
    const lastSeen = new Date();
    await User.findByIdAndUpdate(socket.userId, { lastSeen });
    io.emit("userOffline", { userId: socket.userId, lastSeen });
  });

  /* ---------- UNSEND ---------- */
  socket.on("unsendMessage", async ({ chatId, messageId }) => {
    const msg = await Message.findById(messageId);
    if (!msg || msg.sender.toString() !== socket.userId) return;

    msg.isDeleted = true;
    msg.deletedAt = new Date();
    await msg.save();

    io.to(chatId).emit("messageDeleted", {
      chatId,
      messageId,
      isDeleted: true,
    });
  });

  /* ---------- WEBRTC ---------- */
  socket.on("webrtcOffer", ({ chatId, offer }) =>
    socket.to(chatId).emit("webrtcOffer", offer)
  );

  socket.on("webrtcAnswer", ({ chatId, answer }) =>
    socket.to(chatId).emit("webrtcAnswer", answer)
  );

  socket.on("iceCandidate", ({ chatId, candidate }) =>
    socket.to(chatId).emit("iceCandidate", candidate)
  );

  socket.on("callEnd", ({ chatId }) =>
    socket.to(chatId).emit("callEnd")
  );

  socket.on("callDeclined", ({ chatId }) =>
    socket.to(chatId).emit("callDeclined")
  );
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});

module.exports = { app, server, io };
