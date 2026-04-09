const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");



const {
  reportUser,
  checkIfBlocked,
  removeReport,
  getMyReports,
  getAllReports,
  getReportStats,
  tempBanUser,            // ✅ ADD
  deleteUserPermanently,  // ✅ ADD
  unbanUser,
} = require("../controllers/reportController");

// 🔴 CREATE REPORT
router.post("/", auth, reportUser);

// 🔴 CHECK BLOCK STATUS
router.get("/check/:userId", auth, checkIfBlocked);

// 🔴 GET MY REPORTS
router.get("/my", auth, getMyReports);

// 🔴 DELETE / REMOVE ALLEGATION
router.delete("/:reportId", auth, removeReport);

// 🔴 ALL REPORTS (OLD – keep if you want)
router.get("/admin/all", auth, getAllReports);

// 🔴 REPORT COUNT PER USER
router.get("/admin/stats", auth, getReportStats);

// 🔴 TEMP BAN USER
router.post("/admin/ban", auth, tempBanUser);

// 🔴 PERMANENT DELETE USER
router.delete("/admin/user/:userId", auth, deleteUserPermanently);


// 🔴 UNBAN USER
router.post("/unban", auth, unbanUser);

module.exports = router;
