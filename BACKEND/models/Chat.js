const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isDeleted: { type: Boolean, default: false },
    },
    unreadCounts: { type: Map, of: Number, default: {} },
    typingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
