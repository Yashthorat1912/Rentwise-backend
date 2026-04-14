const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    lease_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    urgency: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    // ✅ STORE FILE NAMES HERE
    files: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);
