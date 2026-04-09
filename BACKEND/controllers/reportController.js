const Report = require("../models/Report");
const User = require("../models/User");


/* ================= REPORT USER ================= */
const reportUser = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reportedId, reason, feedback } = req.body;

    if (!reportedId || !reason) {
      return res.status(400).json({ msg: "reportedId and reason required" });
    }

    if (reporterId === reportedId) {
      return res.status(400).json({ msg: "You cannot report yourself" });
    }

    const reporter = await User.findById(reporterId);
    const reported = await User.findById(reportedId);

    if (!reporter || !reported) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isSwapper = reporter.swappers.some(
      (id) => id.toString() === reportedId
    );

    if (!isSwapper) {
      return res.status(403).json({ msg: "You can report only your swapper" });
    }

    const already = await Report.findOne({
      reporter: reporterId,
      reported: reportedId,
    });

    if (already) {
      return res.status(400).json({ msg: "You already reported this user" });
    }

    await Report.create({
      reporter: reporterId,
      reported: reportedId,
      reason,
      feedback,
    });

    res.status(201).json({ msg: "User reported successfully" });
  } catch (err) {
    console.error("reportUser error:", err);
    res.status(500).json({ msg: "Report failed" });
  }
};

/* ================= CHECK BLOCK ================= */
const checkIfBlocked = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.userId;

    const report = await Report.findOne({
      $or: [
        { reporter: myId, reported: otherUserId },
        { reporter: otherUserId, reported: myId },
      ],
    }).lean();

    res.json({ blocked: !!report });
  } catch (err) {
    res.status(500).json({ blocked: false });
  }
};

/* ================= MY REPORTS ================= */
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user.id })
      .populate("reported", "username name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load reports" });
  }
};

/* ================= REMOVE ALLEGATION ================= */
const removeReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.reportId,
      reporter: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    await report.deleteOne();
    res.json({ msg: "Allegation removed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to remove allegation" });
  }
};

/* ================= ALL REPORTS (NO ADMIN RESTRICTION) ================= */
/* ================= ALL REPORTS (NO RESTRICTION) ================= */
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "username email")
      .populate("reported", "username email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    console.error("getAllReports error:", err);
    res.status(500).json({ msg: "Failed to load reports" });
  }
};















/* ================= REPORT COUNTS PER USER ================= */
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$reported",
          count: { $sum: 1 },
          reasons: { $push: "$reason" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "reportedUser",
        },
      },
      { $unwind: "$reportedUser" },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load report stats" });
  }
};










/* ================= TEMP BAN USER ================= */
const tempBanUser = async (req, res) => {
  try {
    const { userId, days } = req.body;

    const banUntil = new Date();
    banUntil.setDate(banUntil.getDate() + days);

    await User.findByIdAndUpdate(userId, {
      isBanned: true,
      banUntil,
    });

    res.json({ msg: `User banned for ${days} days` });
  } catch (err) {
    res.status(500).json({ msg: "Failed to ban user" });
  }
};

/* ================= PERMANENT DELETE USER ================= */
const deleteUserPermanently = async (req, res) => {
  try {
    const userId = req.params.userId;

    await Report.deleteMany({ reported: userId });
    await User.findByIdAndDelete(userId);

    res.json({ msg: "User permanently deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete user" });
  }
};


const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: "userId required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: false,
        banUntil: null,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "User unbanned successfully" });
  } catch (err) {
    console.error("unbanUser error:", err);
    res.status(500).json({ msg: "Failed to unban user" });
  }
};













/* ================= EXPORTS ================= */
module.exports = {
  reportUser,
  checkIfBlocked,
  getMyReports,
  removeReport,
  getAllReports,
  getReportStats,
  tempBanUser,
  deleteUserPermanently,
  unbanUser, 
};


