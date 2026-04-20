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

    // ✅ GET RELATED DATA
    const lease = await Lease.findById(lease_id);
    if (!lease) return res.status(404).json("Lease not found");

    const property = await Property.findById(lease.property_id);
    if (!property) return res.status(404).json("Property not found");

    const landlord = await User.findById(property.landlord_id);
    if (!landlord) return res.status(404).json("Landlord not found");

    const tenant = await User.findById(lease.tenant_id);
    if (!tenant) return res.status(404).json("Tenant not found");

    // ✅ 🔔 NOTIFICATION TO LANDLORD
    await sendNotification({
      userId: landlord._id,
      token: landlord?.fcmToken,
      type: "PAYMENT_SUCCESS",
      title: "💰 Rent Payment Received",
      body: `${tenant.name} paid ₹${amount}`,
      meta: {
        paymentId: payment._id,
        leaseId: lease._id,
        propertyId: property._id,
      },
    });

    // ✅ 🔔 OPTIONAL: NOTIFY TENANT (confirmation)
    await sendNotification({
      userId: tenant._id,
      token: tenant?.fcmToken,
      type: "PAYMENT_SUCCESS",
      title: "Payment Successful",
      body: `You paid ₹${amount} successfully`,
      meta: {
        paymentId: payment._id,
        leaseId: lease._id,
      },
    });

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
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
