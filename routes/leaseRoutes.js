const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // ✅ ADD THIS

const { createLease, getMyLease } = require("../controllers/leaseController");

// ✅ CREATE LEASE WITH PDF UPLOAD
router.post("/", authMiddleware, upload.single("document"), createLease);

// ✅ GET LEASE
router.get("/my", authMiddleware, getMyLease);

module.exports = router;
