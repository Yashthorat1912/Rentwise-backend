const mongoose = require("mongoose");

const leaseSchema = new mongoose.Schema({
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },

  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  landlord_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  start_date: Date,
  end_date: Date,

  rent_amount: {
    type: Number,
    required: true,
  },

  lease_document_url: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Lease", leaseSchema);
