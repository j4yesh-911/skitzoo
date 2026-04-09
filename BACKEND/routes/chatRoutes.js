const router = require("express").Router();
const path = require("path");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");
const { voiceUpload } = require("../middleware/upload");

// ================= CREATE OR GET CHAT =================
router.post("/find-or-create", auth, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ msg: "receiverId required" });
    }

    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await Chat.create({
        members: [senderId, receiverId],
      });
    }

    res.json(chat);
  } catch (err) {
    console.error("chat error:", err);
    res.status(500).json({ msg: "Chat failed" });
  }
});

// ================= GET MY CHATS =================
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      members: { $in: [req.user.id] },
    })
      .populate("members", "name profilePic")
      .sort({ updatedAt: -1 });

    // 🔹 Convert Map to Object for JSON response (important fix)
    const chatsWithUnreadCounts = chats.map((chat) => {
      const chatObj = chat.toObject();
      if (chatObj.unreadCounts instanceof Map) {
        chatObj.unreadCounts = Object.fromEntries(chatObj.unreadCounts);
      }
      return chatObj;
    });

    res.json(chatsWithUnreadCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load chats" });
  }
});

module.exports = router;

// ================= VOICE NOTE UPLOAD =================
// Uploads a single voice file (field name: "voice")
router.post(
  "/:chatId/voice",
  auth,
  voiceUpload.single("voice"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No voice file uploaded" });
      }

      console.log("📁 Voice upload file:", {
        filename: req.file.filename,
        path: req.file.path,
        secure_url: req.file.secure_url,
        mimetype: req.file.mimetype,
      });

      let audioUrl;

      // ✅ CASE 1: Cloudinary upload (preferred)
      if (req.file.secure_url) {
        audioUrl = req.file.secure_url;
      }
      // ✅ CASE 2: Local disk fallback
      else if (req.file.filename) {
        audioUrl = `/uploads/voices/${req.file.filename}`;
      }
      // ❌ SHOULD NEVER HAPPEN, but safety
      else {
        return res.status(500).json({ msg: "Unable to determine audio URL" });
      }

      const senderId = req.user.id;
      const chatId = req.params.chatId;

      const message = await Message.create({
        chatId,
        sender: senderId,
        type: "voice",
        audioUrl,
        status: "sent",
      });

      // Update chat metadata
      const chat = await Chat.findById(chatId).select("members");
      if (chat) {
        const receiverId = chat.members.find((m) => m.toString() !== senderId);

        await Chat.findByIdAndUpdate(chatId, {
          $inc: { [`unreadCounts.${receiverId}`]: 1 },
          $set: {
            lastMessage: {
              text: "🎧 Voice message",
              sender: senderId,
            },
            updatedAt: Date.now(),
          },
        });
      }

      res.status(200).json(message);
    } catch (err) {
      console.error("❌ Voice upload error:", err);
      res.status(500).json({ msg: "Voice upload failed" });
    }
  },
);
