const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
  "video/3gpp",
];

const DEFAULT_MAX_FILE_SIZE_MB = 200;

const fileFilter = (req, file, cb) => {
  if (
    ALLOWED_IMAGE_TYPES.includes(file.mimetype) ||
    ALLOWED_VIDEO_TYPES.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Allowed images: JPEG/JPG, PNG, WebP, GIF, SVG, AVIF. Allowed videos: MP4, MPEG, WebM, OGG, MOV, AVI, MKV, 3GP.",
      ),
      false,
    );
  }
};

const createUpload = (subfolder, options = {}) => {
  const { maxFileSizeMB = DEFAULT_MAX_FILE_SIZE_MB } = options;
  const dest = path.join(__dirname, "../uploads", subfolder);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 },
  });
};

module.exports = createUpload;
