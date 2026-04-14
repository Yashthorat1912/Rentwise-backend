const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  getPayments,
} = require("../controllers/paymentController");

router.post("/", authMiddleware, createPayment);

router.get("/:leaseId", authMiddleware, getPayments);

module.exports = router;
