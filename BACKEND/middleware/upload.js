const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

function uniqueId() {
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

// If Cloudinary isn't configured, fall back to disk storage under ./uploads
const uploadsRoot = path.join(__dirname, "..", "uploads");
function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

let voiceStorage;
let profilePicStorage;

if (cloudinary && cloudinary._isConfigured) {
  voiceStorage = cloudinaryStorage({
    cloudinary,
    params: (req, file, cb) => {
      cb(null, {
        folder: "chat/voices",
        resource_type: "auto",
        public_id: uniqueId(),
      });
    },
  });

  profilePicStorage = cloudinaryStorage({
    cloudinary,
    params: (req, file, cb) => {
      cb(null, {
        folder: "profile/pics",
        resource_type: "image",
        public_id: uniqueId(),
      });
    },
    allowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
  });
} else {
  // local disk fallback
  const voiceDir = path.join(uploadsRoot, "voices");
  const profileDir = path.join(uploadsRoot, "profile", "pics");
  ensureDir(voiceDir);
  ensureDir(profileDir);

  voiceStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, voiceDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".webm";
      cb(null, `${uniqueId()}${ext}`);
    },
  });

  profilePicStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, profileDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      cb(null, `${uniqueId()}${ext}`);
    },
  });
}

const voiceUpload = multer({
  storage: voiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed =
      /^audio\//.test(file.mimetype) ||
      /^video\//.test(file.mimetype) ||
      /^image\//.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error("Only audio, image, or video files are allowed"), false);
  },
});

const profilePicUpload = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

module.exports = { voiceUpload, profilePicUpload };
