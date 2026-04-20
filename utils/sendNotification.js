const admin = require("../config/firebase");
const Notification = require("../models/Notification");

const sendNotification = async ({
  userId,
  token = null,
  type = "GENERAL",
  title,
  body,
  meta = {},
}) => {
  try {
    // ✅ SAVE TO DB
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      body,
      meta,
      isRead: false,
    });

    // ✅ REALTIME (Socket.IO)
    const io = global.io;
    if (io) {
      io.to(userId.toString()).emit("notification", notification);
    }

    // ✅ PUSH (Firebase)
    if (token) {
      const message = {
        notification: { title, body },
        token,
      };

      await admin.messaging().send(message);
    }

    console.log("Notification saved + emitted", notification._id);

    return notification;
  } catch (error) {
    console.log("Notification error:", error);
  }
};

module.exports = sendNotification;
