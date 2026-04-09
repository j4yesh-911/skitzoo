// const router = require("express").Router();
// const auth = require("../middleware/authMiddleware");
// // const upload = require("../middleware/uploadMiddleware");
// const { profilePicUpload } = require("../middleware/upload");

// const {
//   createPost,
//   getAllPosts,
//   likePost,
//   getMyPosts,
//   getPostsByUser,
// } = require("../controllers/postController");

// router.post("/", auth, profilePicUpload.single("image"), createPost);
// router.get("/", auth, getAllPosts);
// router.post("/like/:id", auth, likePost);
// router.get("/my", auth, getMyPosts);
// router.get("/user/:userId", auth, getPostsByUser); // 👈 ADD
// router.delete("/:id", auth, deletePost);


// module.exports = router;
console.log("✅ postRoutes loaded");

const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { profilePicUpload } = require("../middleware/upload");

const {
  createPost,
  getAllPosts,
  likePost,
  getMyPosts,
  getPostsByUser,
  deletePost,
  getFeedPosts ,
} = require("../controllers/postController");

// Create post
router.post("/", auth, profilePicUpload.single("image"), createPost);

router.get("/feed", auth, getFeedPosts);

// Get posts
router.get("/", auth, getAllPosts);
router.get("/my", auth, getMyPosts);
router.get("/user/:userId", auth, getPostsByUser);



// Like
router.post("/like/:id", auth, likePost);

// Delete
router.delete("/:id", auth, deletePost);


router.get("/feed", (req, res) => {
  console.log("🔥 FEED ROUTE HIT");
  res.send("Feed working");
});

module.exports = router;