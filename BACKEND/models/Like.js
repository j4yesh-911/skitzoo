const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes from same user to same user
likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);