const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/save-token", async (req, res) => {
  try {
    const { token, user_id } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    // prevent duplicates
    const exists = await Notification.findOne({ token });
    if (exists) {
      return res.json({ message: "Token already exists" });
    }

    const newToken = await Notification.create({
      token,
      user_id,
    });

    res.json(newToken);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const notifications = await Notification.find({
    user_id: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

router.put("/read", authMiddleware, async (req, res) => {
  await Notification.updateMany({ user_id: req.user.id }, { read: true });

  res.json("Marked as read");
});

module.exports = router;
