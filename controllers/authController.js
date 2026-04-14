const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json("User already exists");

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json("Invalid credentials");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
const sendEmail = require("../utils/sendEmail");

exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ⏱ Expiry (5 minutes)
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    // 📧 Send Email
    await sendEmail(
      email,
      "RentWise Password Reset",
      `<h2>Your OTP is: ${otp}</h2><p>Valid for 5 minutes</p>`,
    );

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // ❌ Invalid OTP
    if (user.otp !== otp) {
      return res.status(400).json("Invalid OTP");
    }

    // ⏱ Expired OTP
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json("OTP expired");
    }

    // 🔐 Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    // 🧹 Clear OTP
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
