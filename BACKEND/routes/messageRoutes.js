const router = require("express").Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const auth = require("../middleware/authMiddleware");
const { voiceUpload } = require("../middleware/upload");

router.post("/", auth, async (req, res) => {
  const { chatId, text } = req.body;

  const message = await Message.create({
    chatId,
    sender: req.user.id,
    text,
  });

  const chat = await Chat.findById(chatId);
  const otherMember = chat.members.find(
    (m) => m.toString() !== req.user.id.toString(),
  );
  if (otherMember) {
    const currentUnread = chat.unreadCounts.get(otherMember.toString()) || 0;
    chat.unreadCounts.set(otherMember.toString(), currentUnread + 1);
    await chat.save();
  }

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: {
      text,
      sender: req.user.id,
    },
    updatedAt: Date.now(),
  });

  res.status(201).json(message);
});

router.get("/:chatId", auth, async (req, res) => {
  const messages = await Message.find({
    chatId: req.params.chatId,
    isDeleted: false,
  }).sort({ createdAt: 1 });

  res.json(messages);
});

// Mark messages as read by current user
router.post("/:chatId/read", auth, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (chat) {
    chat.unreadCounts.set(req.user.id.toString(), 0);
    await chat.save();
  }

  // Update message status to seen for messages from other users
  await Message.updateMany(
    {
      chatId: req.params.chatId,
      sender: { $ne: req.user.id },
      status: { $ne: "seen" },
    },
    {
      status: "seen",
      $addToSet: {
        readBy: {
          userId: req.user.id,
          readAt: new Date(),
        },
      },
    },
  );

  res.status(200).json({ success: true });
});

// Get message read status
router.get("/:messageId/status", auth, async (req, res) => {
  const message = await Message.findById(req.params.messageId).populate(
    "readBy.userId",
    "name profilePic",
  );
  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  res.json({
    _id: message._id,
    status: message.status,
    readBy: message.readBy || [],
    createdAt: message.createdAt,
  });
});
// ================= VOICE NOTE UPLOAD =================
// Uploads a single voice file (field name: "voice")
// - Cloudinary → returns secure_url
// - Local disk → returns PUBLIC /uploads/... URL
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    voiceUpload.single("voice")(req, res, (err) => {
      if (err) {
        console.error("Voice upload middleware error:", err);
        return res.status(400).json({
          error: err.message || "Failed to upload voice file",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No voice file provided" });
      }

      console.log("Voice upload req.file:", req.file);

      let audioUrl;

      // ✅ CASE 1: Cloudinary upload
      if (req.file.secure_url) {
        audioUrl = req.file.secure_url;
      }
      // ✅ CASE 2: Local disk upload (PUBLIC URL ONLY)
      else if (req.file.filename) {
        audioUrl = `/uploads/voices/${req.file.filename}`;
      }
      // ❌ SHOULD NEVER HAPPEN
      else {
        console.error("Invalid uploaded file object:", req.file);
        return res
          .status(500)
          .json({ error: "Unable to determine uploaded file URL" });
      }

      // 🚫 HARD SAFETY: never return system paths
      if (audioUrl.includes(":\\") || audioUrl.includes(":\\")) {
        console.error("Blocked invalid audioUrl:", audioUrl);
        return res.status(500).json({ error: "Invalid audio URL generated" });
      }

      res.status(201).json({
        audioUrl, // ✅ always PUBLIC URL
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload voice file" });
    }
  },
);

module.exports = router;
