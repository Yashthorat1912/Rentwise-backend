const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    lease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["successful", "failed"],
      default: "successful",
    },

    payment_date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
