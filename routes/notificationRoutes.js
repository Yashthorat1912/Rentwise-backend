const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ GET ALL NOTIFICATIONS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ MARK ALL AS READ
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user.id }, { isRead: true });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ MARK SINGLE AS READ
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET UNREAD COUNT (VERY IMPORTANT FOR BELL 🔔)
router.get("/unread/count", authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user_id: req.user.id,
      isRead: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE ALL (optional)
router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ user_id: req.user.id });
    res.json({ message: "All notifications deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
