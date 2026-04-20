const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Lease = require("./models/Lease");
const connectDB = require("./config/db");

const maintenanceRoutes = require("./routes/maintenanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/", (req, res) => {
  res.send("RentWise API running");
});

app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/leases", require("./routes/leaseRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ✅ IMPORTANT: create server FIRST
const http = require("http");
const server = http.createServer(app);

// ✅ THEN create io
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ THEN import model
const Message = require("./models/Message");

// ✅ THEN use io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (leaseId) => {
    socket.join(leaseId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { lease_id, sender_id, content } = data;

      // ❗ safety check
      if (!lease_id) {
        console.log("❌ lease_id missing");
        return;
      }

      const lease = await Lease.findById(lease_id);

      if (!lease) {
        console.log("❌ Lease not found");
        return;
      }

      // ✅ AUTO DETECT RECEIVER
      const receiver_id =
        lease.tenant_id.toString() === sender_id
          ? lease.landlord_id
          : lease.tenant_id;

      // ✅ SAVE MESSAGE
      const savedMessage = await Message.create({
        sender_id,
        receiver_id,
        lease_id,
        content,
      });

      // ✅ Populate sender name
      const populated = await savedMessage.populate("sender_id", "name");

      // ✅ Emit to room
      io.to(lease_id).emit("receive_message", populated);
    } catch (err) {
      console.error("Socket Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ finally start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
