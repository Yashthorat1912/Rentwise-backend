const Payment = require("../models/Payment");

// Create Payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    res.json(payment);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Get Payments by Lease
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      lease_id: req.params.leaseId,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
