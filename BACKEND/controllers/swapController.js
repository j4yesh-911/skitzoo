const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");

// ================= SEND REQUEST =================
exports.sendSwapRequest = async (req, res) => {
  try {
    const { toUser, skillOffered, skillRequested } = req.body;

    const fromUser = await User.findById(req.user.id);
    const targetUser = await User.findById(toUser);

    if (!fromUser || !targetUser) {
      return res.status(400).json({ msg: "Invalid users" });
    }

    // 🚫 ALREADY SWAPPERS (FRIENDS) — FIXED
    const alreadySwapper = fromUser.swappers.some(
      (id) => id.toString() === toUser.toString()
    );

    if (alreadySwapper) {
      return res.status(400).json({
        msg: "Already swap partners",
      });
    }

    // 🚫 PENDING REQUEST (ANY DIRECTION)
    const pending = await SwapRequest.findOne({
      $or: [
        {
          fromUser: fromUser._id,
          toUser,
          status: "pending",
        },
        {
          fromUser: toUser,
          toUser: fromUser._id,
          status: "pending",
        },
      ],
    });

    if (pending) {
      return res.status(400).json({
        msg: "Swap request already pending",
      });
    }

    // ✅ CREATE REQUEST
    const request = await SwapRequest.create({
      fromUser: fromUser._id,
      toUser,
      skillOffered,
      skillRequested,
    });

    res.status(201).json({
      msg: "Swap request sent",
      request,
    });
  } catch (err) {
    console.error("sendSwapRequest error:", err);
    res.status(500).json({ msg: "Failed to send request" });
  }
};

// ================= GET MY REQUESTS =================
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      toUser: req.user.id,
      status: "pending",
    }).populate("fromUser", "username name profilePic");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load requests" });
  }
};

// ================= ACCEPT REQUEST (CORE LOGIC) =================
exports.acceptRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    const userA = await User.findById(request.fromUser);
    const userB = await User.findById(request.toUser);

    if (!userA || !userB) {
      return res.status(400).json({
        msg: "One of the users does not exist",
      });
    }

    // mark accepted
    request.status = "accepted";
    await request.save();

    // 🔥 A <-> B (BOTH SIDES)
    await User.findByIdAndUpdate(userA._id, {
      $addToSet: { swappers: userB._id },
    });

    await User.findByIdAndUpdate(userB._id, {
      $addToSet: { swappers: userA._id },
    });

    res.json({ msg: "Swap accepted successfully" });
  } catch (err) {
    console.error("acceptRequest error:", err);
    res.status(500).json({ msg: "Failed to accept swap" });
  }
};

// ================= DECLINE REQUEST =================
exports.declineRequest = async (req, res) => {
  try {
    await SwapRequest.findByIdAndUpdate(req.params.id, {
      status: "declined",
    });

    res.json({ msg: "Swap declined" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to decline" });
  }
};


// ================= GET MY SENT REQUESTS =================
exports.getMySentRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      fromUser: req.user.id,
      status: "pending",
    }).select("toUser");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load sent requests" });
  }
};
