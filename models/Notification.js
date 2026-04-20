const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ TYPE (CRITICAL)
    type: {
      type: String,
      enum: [
        "GENERAL",
        "MAINTENANCE_CREATED",
        "MAINTENANCE_UPDATED",
        "MAINTENANCE_PROGRESS",
        "CHAT_MESSAGE",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "LEASE_EXPIRING",
        "PROPERTY_UPDATE",
      ],
      default: "GENERAL",
    },

    title: {
      type: String,
      required: true,
    },

    body: {
      type: String,
      required: true,
    },

    // ✅ EXTRA DATA (VERY IMPORTANT)
    meta: {
      type: Object,
      default: {},
    },

    // ✅ READ STATUS
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
