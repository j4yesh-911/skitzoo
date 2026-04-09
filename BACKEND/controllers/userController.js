const User = require("../models/User");
const Like = require("../models/Like");
const { generateBio } = require("../services/geminiService");


/* UPLOAD PROFILE PICTURE */
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    // Always prefer Cloudinary secure_url
    const profilePicUrl = req.file.secure_url
      ? req.file.secure_url
      : req.file.path; // fallback (temporary safety)

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: profilePicUrl },
      { new: true }
    ).select("-password");

    res.status(200).json({ msg: "Profile picture uploaded", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed" });
  }
};

/*REMOVE PROFILE PICTURE */
exports.removeProfilePic = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: "" },
      { new: true }
    ).select("-password");

    res.status(200).json({ msg: "Profile picture removed", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to remove profile picture" });
  }
};

/*GENERATE BIO WITH AI */
/* ================= GENERATE BIO WITH AI ================= */
exports.generateBio = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ msg: "Prompt is required" });
    }

    if (prompt.length > 200) {
      return res.status(400).json({ msg: "Prompt too long (max 200 chars)" });
    }

    const bio = await generateBio(prompt);

    return res.status(200).json({
      msg: "Bio generated successfully",
      bio,
    });
  } catch (err) {
    console.error("❌ Bio Controller Error:", err.message);
    return res.status(500).json({ msg: err.message });
  }
};

/* ================= COMPLETE PROFILE ================= */
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      username,
      age,
      gender,
      phone,
      location,
      city,
      state,
      bio,
      skillsToTeach,
      skillsToLearn,
      profilePic,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        age,
        gender,
        phone,
        location,
        city,
        state,
        bio,
        skillsToTeach,
        skillsToLearn,
        profilePic,
        isProfileComplete: true,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({ msg: "Profile completed", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user.id },
      isProfileComplete: true,
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

/* ================= GET POTENTIAL MATCHES ================= */
exports.getPotentialMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    const likedUserIds = await Like.find({
      fromUser: req.user.id,
    }).distinct("toUser");

    const users = await User.find({
      _id: { $ne: req.user.id, $nin: likedUserIds },
      isProfileComplete: true,
      $or: [
        { skillsToTeach: { $in: currentUser.skillsToLearn || [] } },
        { skillsToLearn: { $in: currentUser.skillsToTeach || [] } },
      ],
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch potential matches" });
  }
};

/* ================= GET USER BY ID ================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");

    res.status(200).json({ msg: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Profile update failed" });
  }
};

/* ================= MATCH USERS ================= */
exports.matchUsers = async (req, res) => {
  let { learnSkill, teachSkill, perfectMatch = false } = req.body;

  if (!learnSkill || (perfectMatch && !teachSkill)) {
    return res.status(400).json({ msg: "Skills required" });
  }

  learnSkill = learnSkill.trim();
  teachSkill = teachSkill ? teachSkill.trim() : "";

  try {
    let query;

    if (perfectMatch) {
      // Perfect match: users who teach learnSkill and learn teachSkill
      query = {
        _id: { $ne: req.user.id },
        isProfileComplete: true,
        skillsToTeach: { $regex: new RegExp(`^${learnSkill}$`, "i") },
        skillsToLearn: { $regex: new RegExp(`^${teachSkill}$`, "i") },
      };
    } else {
      // Non-perfect match: users who teach learnSkill (regardless of what they learn)
      query = {
        _id: { $ne: req.user.id },
        isProfileComplete: true,
        skillsToTeach: { $regex: new RegExp(`^${learnSkill}$`, "i") },
      };
    }

    const users = await User.find(query).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error("MATCH ERROR:", err);
    res.status(500).json({ msg: "Match failed" });
  }
};
