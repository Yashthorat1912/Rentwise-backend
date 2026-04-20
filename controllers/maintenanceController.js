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
    const fileUrls = req.files ? req.files.map((file) => file.path) : [];

    const request = await MaintenanceRequest.create({
      lease_id,
      title,
      description,
      urgency,
      files: fileUrls,
    });

    // ✅ GET RELATED DATA
    const lease = await Lease.findById(lease_id);
    if (!lease) return res.status(404).json("Lease not found");

    const property = await Property.findById(lease.property_id);
    if (!property) return res.status(404).json("Property not found");

    const landlord = await User.findById(property.landlord_id);
    if (!landlord) return res.status(404).json("Landlord not found");

    // ✅ 🔔 NOTIFICATION TO LANDLORD
    await sendNotification({
      userId: landlord._id,
      token: landlord?.fcmToken,
      type: "MAINTENANCE_CREATED",
      title: "New Maintenance Request",
      body: `${title} - ${urgency}`,
      meta: {
        requestId: request._id,
        propertyId: property._id,
        leaseId: lease._id,
      },
    });

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

// ✅ Update status
exports.updateStatus = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { status } = req.body;

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!request) return res.status(404).json("Request not found");

    // ✅ SOCKET UPDATE (REALTIME)
    io.to(request.lease_id.toString()).emit("maintenance_updated", request);

    // ✅ GET TENANT
    const lease = await Lease.findById(request.lease_id);
    if (!lease) return res.status(404).json("Lease not found");

    const tenant = await User.findById(lease.tenant_id);
    if (!tenant) return res.status(404).json("Tenant not found");

    // ✅ DETERMINE TYPE (SMART)
    let notificationType = "MAINTENANCE_UPDATED";

    if (status === "COMPLETED") {
      notificationType = "MAINTENANCE_PROGRESS";
    }

    // ✅ 🔔 NOTIFICATION TO TENANT
    await sendNotification({
      userId: tenant._id,
      token: tenant?.fcmToken,
      type: notificationType,
      title: "Maintenance Update",
      body: `Status changed to ${status}`,
      meta: {
        requestId: request._id,
        leaseId: lease._id,
      },
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
