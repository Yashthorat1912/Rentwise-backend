const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { getTenants } = require("../controllers/userController");

router.get("/tenants", getTenants);

// ✅ ADD THIS
router.put("/save-fcm-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fcmToken: req.body.token },
      { new: true },
    );

    res.json(user);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
