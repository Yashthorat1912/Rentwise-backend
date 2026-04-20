const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  coverImage: {
    type: String,
  },

  landlord_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Property", propertySchema);
