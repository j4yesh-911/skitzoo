// routes/authRoutes.js
const express = require("express");
const router = express.Router();

console.log("AUTH ROUTES FILE LOADED");

const { signup, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/ping", (req, res) => {
  res.send("pong");
});

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMe); // ✅ protected

module.exports = router;
