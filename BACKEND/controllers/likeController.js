const Like = require("../models/Like");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.createLike = async (req, res) => {
  try {
    const { toUserId, action } = req.body;
    const fromUserId = req.user.id;

    if (!toUserId || !action) {
      return res.status(400).json({ msg: "toUserId and action required" });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ msg: "Cannot like yourself" });
    }

    // Check if already exists
    const existing = await Like.findOne({ fromUser: fromUserId, toUser: toUserId });
    if (existing) {
      return res.status(400).json({ msg: "Already acted on this user" });
    }

    // Create like/dislike
    const like = new Like({
      fromUser: fromUserId,
      toUser: toUserId,
      action,
    });
    await like.save();

    // Check for mutual like
    if (action === "like") {
      const mutual = await Like.findOne({
        fromUser: toUserId,
        toUser: fromUserId,
        action: "like",
      });
      if (mutual) {
        // Create chat if not exists
        let chat = await Chat.findOne({
          members: { $all: [fromUserId, toUserId] },
        });
        if (!chat) {
          chat = new Chat({
            members: [fromUserId, toUserId],
          });
          await chat.save();
        }
        return res.json({ msg: "It's a match!", chatId: chat._id });
      }
    }

    res.json({ msg: "Action recorded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const likes = await Like.find({ fromUser: req.user.id });
    res.json(likes);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};