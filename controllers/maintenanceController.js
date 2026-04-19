const MaintenanceRequest = require("../models/MaintenanceRequest");
const sendNotification = require("../utils/sendNotification");
const Lease = require("../models/Lease");
const Property = require("../models/Property");
const User = require("../models/User");

// ✅ Create maintenance request
exports.createRequest = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { lease_id, title, description, urgency } = req.body;

    const fileNames = req.files ? req.files.map((file) => file.filename) : [];

    const request = await MaintenanceRequest.create({
      lease_id,
      title,
      description,
      urgency,
      files: fileNames,
    });

    // ✅ 🔔 SEND NOTIFICATION TO LANDLORD
    const lease = await Lease.findById(lease_id);
    const property = await Property.findById(lease.property_id);
    const landlord = await User.findById(property.landlord_id);

    await sendNotification(
      landlord?.fcmToken,
      "New Maintenance Request",
      `${title} - ${urgency}`,
    );

    res.json(request);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error creating request");
  }
};

// ✅ Landlord → get ALL requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find().populate({
      path: "lease_id",
      populate: {
        path: "property_id",
      },
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Tenant → get MY requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({
      lease_id: req.query.lease_id,
    });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { status } = req.body;

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    // ✅ SOCKET UPDATE
    io.to(request.lease_id.toString()).emit("maintenance_updated", request);

    // ✅ 🔔 SEND NOTIFICATION TO TENANT
    const lease = await Lease.findById(request.lease_id);
    const tenant = await User.findById(lease.tenant_id);

    await sendNotification(
      tenant?.fcmToken,
      "Request Update",
      `Status changed to ${status}`,
    );

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
