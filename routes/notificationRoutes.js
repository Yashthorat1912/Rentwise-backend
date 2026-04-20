const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Get my notifications
router.get("/", authMiddleware, async (req, res) => {
  const notifications = await Notification.find({
    user_id: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

// ✅ Mark as read
router.put("/read", authMiddleware, async (req, res) => {
  await Notification.updateMany({ user_id: req.user.id }, { read: true });

  res.json("Marked as read");
});

module.exports = router;
