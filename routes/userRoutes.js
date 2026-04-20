const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getTenants } = require("../controllers/userController");

router.get("/tenants", getTenants);

// ✅ SAVE FCM TOKEN
router.put("/save-fcm-token", authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      fcmToken: token,
    });

    res.json({ message: "FCM token saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
