const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, likeController.createLike);
router.get("/", authMiddleware, likeController.getLikes);

module.exports = router;