const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createProperty,
  getProperties,
  getProperty,
  deleteProperty,
} = require("../controllers/propertyController");

// ✅ IMPORTANT LINE
router.post("/", authMiddleware, upload.single("image"), createProperty);

router.get("/", authMiddleware, getProperties);
router.get("/:id", authMiddleware, getProperty);
router.delete("/:id", authMiddleware, deleteProperty);

module.exports = router;
