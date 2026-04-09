const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isProfileComplete: false,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      msg: "Signup successful",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input - check for empty strings and null/undefined
    if (!email || !password || email.trim() === "" || password.trim() === "") {
      return res.status(400).json({ 
        msg: "Email and password are required",
        code: "MISSING_FIELDS"
      });
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(401).json({ 
        msg: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        msg: "Invalid email or password",
        code: "INVALID_CREDENTIALS"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful",
      token,
      isProfileComplete: user.isProfileComplete || false,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      msg: "Server error. Please try again later.",
      code: "SERVER_ERROR"
    });
  }
};

// ================= GET LOGGED-IN USER (FIXED) =================
// ================= GET LOGGED-IN USER =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("swappers", "name username profilePic")
      .select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 🔥 REMOVE NON-EXISTING USERS
    user.swappers = user.swappers.filter(Boolean);

    res.json(user);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ msg: "Failed to fetch user" });
  }
};
