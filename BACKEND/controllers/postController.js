const Post = require("../models/Post");
const User = require("../models/User");

/* ================= CREATE POST ================= */
exports.createPost = async (req, res) => {
  try {
    // ✅ FIX: req.file is undefined when no image is attached — was crashing here
    const imageUrl = req.file
      ? req.file.secure_url || req.file.path || `uploads/${req.file.filename}`
      : "";

    const post = await Post.create({
      user: req.user.id,
      image: imageUrl,
      caption: req.body.caption,
    });

    // ✅ Populate user so the returned post has name/username/profilePic
    const populated = await Post.findById(post._id).populate(
      "user",
      "name username profilePic"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL POSTS ================= */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= LIKE POST ================= */
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.some((like) => like.toString() === userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((like) => like.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      "user",
      "name username profilePic"
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET MY POSTS ================= */
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET POSTS BY USER ================= */
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE POST ================= */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ msg: "Post deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET FEED POSTS (SWAPPERS ONLY) ================= */
exports.getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Returns posts from everyone in the current user's swappers list
    const posts = await Post.find({
      user: { $in: currentUser.swappers },
    })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};