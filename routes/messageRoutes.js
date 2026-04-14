const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

router.post("/", authMiddleware, sendMessage);

router.get("/:leaseId", authMiddleware, getMessages);

module.exports = router;
