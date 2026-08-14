import multer from "multer";
import path from "path";
import ApiError from "../utils/apiError.js";

// Store file in memory (Cloudinary ke liye best)
const storage = multer.memoryStorage();

// Allowed MIME types
const allowedMimeTypes = [
  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",
  "text/markdown",
  "text/csv",

  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new ApiError(
      400,
      `Unsupported file type: ${path.extname(file.originalname)}`
    )
  );
};

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },

  fileFilter,
});

export default upload;