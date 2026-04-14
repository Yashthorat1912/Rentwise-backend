const MaintenanceRequest = require("../models/MaintenanceRequest");

// ✅ Create maintenance request
exports.createRequest = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { lease_id, title, description, urgency } = req.body;

    // ✅ extract filenames
    const fileNames = req.files ? req.files.map((file) => file.filename) : [];

    const request = await MaintenanceRequest.create({
      lease_id,
      title,
      description,
      urgency,
      files: fileNames, // ✅ store here
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

exports.updateStatus = async (req, res) => {
  try {
    const io = req.app.get("io"); // ✅ GET IO

    const { status } = req.body;

    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }, // ✅ FIX WARNING
    );

    // ✅ REAL-TIME UPDATE
    io.to(request.lease_id.toString()).emit("maintenance_updated", request);

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
