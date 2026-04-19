const admin = require("../config/firebase");
const Notification = require("../models/notification");

const sendNotification = async (token, title, body, userId) => {
  if (!token) return;

  const message = {
    notification: { title, body },
    token,
  };

  try {
    await admin.messaging().send(message);

    // ✅ SAVE TO DATABASE
    await Notification.create({
      user_id: userId,
      title,
      body,
    });

    console.log("Notification sent + saved");
  } catch (error) {
    console.log("Notification error:", error);
  }
};

module.exports = sendNotification;
