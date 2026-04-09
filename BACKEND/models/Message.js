const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["text", "voice"], default: "text" },
    text: { type: String, required: function() { return this.type === "text"; } },
    audioUrl: { type: String, required: function() { return this.type === "voice"; } },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent"
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now }
      }
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
