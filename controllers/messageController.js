const Message = require("../models/Message");
const Lease = require("../models/Lease");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// ✅ Get messages
exports.getMessages = async (req, res) => {
  try {
    const { leaseId } = req.params;

    if (!leaseId) {
      return res.status(400).json({ message: "leaseId is required" });
    }

    const messages = await Message.find({
      lease_id: leaseId,
    })
      .populate("sender_id", "name")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// ✅ Send message
exports.sendMessage = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { lease_id, content } = req.body;

    if (!lease_id) {
      return res.status(400).json({ message: "lease_id is required" });
    }

    const lease = await Lease.findById(lease_id);
    if (!lease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    // ✅ Auto detect receiver
    const receiver_id =
      lease.tenant_id.toString() === req.user.id
        ? lease.landlord_id
        : lease.tenant_id;

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      lease_id,
      content,
    });

    // ✅ REALTIME MESSAGE (chat UI update)
    io.to(lease_id.toString()).emit("new_message", message);

    // ✅ GET RECEIVER USER
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // ✅ GET SENDER NAME
    const sender = await User.findById(req.user.id);

    // ✅ 🔔 SEND NOTIFICATION
    await sendNotification({
      userId: receiver._id,
      token: receiver?.fcmToken,
      type: "CHAT_MESSAGE",
      title: "New Message",
      body: `${sender?.name || "Someone"}: ${content}`,
      meta: {
        leaseId: lease._id,
        senderId: sender._id,
      },
    });

    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
