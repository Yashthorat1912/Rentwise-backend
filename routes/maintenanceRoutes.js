const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createRequest,
  getRequests,
  getAllRequests,
  updateStatus,
} = require("../controllers/maintenanceController");

// create request
router.post("/", authMiddleware, upload.array("files"), createRequest);

// ✅ Landlord - get ALL requests
router.get("/", authMiddleware, getAllRequests);

// ✅ Tenant - get MY requests
router.get("/my", authMiddleware, getRequests);

// update status
router.put("/:id", authMiddleware, updateStatus);

module.exports = router;
