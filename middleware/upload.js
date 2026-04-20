const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "image";

    // ✅ Detect file type
    if (file.mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw";
    }

    return {
      folder: "rentwise",
      resource_type: resourceType, // ✅ IMPORTANT
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "mp4",
        "mov",
        "avi",
        "pdf",
      ],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ 10MB limit
});

module.exports = upload;
