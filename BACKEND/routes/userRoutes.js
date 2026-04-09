const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { matchUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { profilePicUpload } = require("../middleware/upload");
const {
  completeProfile,
  getAllUsers,
  getPotentialMatches,
  updateProfile,
  getUserById,
  uploadProfilePic,
  removeProfilePic,
  generateBio,
} = require("../controllers/userController");

// ================= USER ROUTES =================

router.get("/", authMiddleware, getAllUsers);
router.get("/potential-matches", authMiddleware, getPotentialMatches);
router.get("/:id", authMiddleware, getUserById);

router.post("/complete-profile", authMiddleware, completeProfile);
router.put("/update-profile", authMiddleware, updateProfile);

// Cloudinary-based profile picture upload
router.post(
  "/upload-profile-pic",
  authMiddleware,
  profilePicUpload.single("profilePic"),
  uploadProfilePic,
);

router.delete("/remove-profile-pic", authMiddleware, removeProfilePic);
router.post("/generate-bio", authMiddleware, generateBio);
router.get("/test-gemini", async (req, res) => {
  try {
    const {
      generateBio: generateBioWithAI,
    } = require("../services/geminiService");
    const testBio = await generateBioWithAI("Test user who is a web developer");
    res.json({ success: true, bio: testBio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/match", authMiddleware, matchUsers);
module.exports = router;
