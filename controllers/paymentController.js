const Payment = require("../models/Payment");
const Lease = require("../models/Lease");
const Property = require("../models/Property");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// ✅ CREATE PAYMENT
exports.createPayment = async (req, res) => {
  try {
    const { lease_id, amount } = req.body;

    // 🔒 validation
    if (!lease_id || !amount) {
      return res.status(400).json("Missing required fields");
    }

    // ✅ create payment
    const payment = await Payment.create({
      lease_id,
      amount,
      status: "successful",
      payment_date: new Date(),
    });

    // 🔔 SEND NOTIFICATION TO LANDLORD
    const lease = await Lease.findById(lease_id);

    if (!lease) return res.status(404).json("Lease not found");

    const property = await Property.findById(lease.property_id);
    const landlord = await User.findById(property.landlord_id);
    const tenant = await User.findById(lease.tenant_id);

    if (landlord?.fcmToken) {
      await sendNotification(
        landlord.fcmToken,
        "💰 Rent Payment Received",
        `${tenant.name} paid ₹${amount}`,
        landlord._id,
      );
    }

    res.json(payment);
  } catch (error) {
    console.log(error);
    res.status(500).json(error.message);
  }
};

// ✅ GET PAYMENTS BY LEASE
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      lease_id: req.params.leaseId,
    }).sort({ createdAt: -1 }); // latest first

    res.json(payments);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
