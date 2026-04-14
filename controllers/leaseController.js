const Lease = require("../models/Lease");
const Property = require("../models/Property");

exports.createLease = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const lease = await Lease.create({
      property_id: req.body.property_id,
      tenant_id: req.body.tenant_id,
      landlord_id: req.user.id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      rent_amount: req.body.rent_amount,
      lease_document_url: req.file ? req.file.path : "",
    });

    res.json(lease);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
};

exports.getMyLease = async (req, res) => {
  try {
    let lease;

    if (req.user.role === "tenant") {
      lease = await Lease.findOne({ tenant_id: req.user.id })
        .populate("property_id")
        .populate("landlord_id", "name email");
    } else {
      lease = await Lease.find({ landlord_id: req.user.id })
        .populate("property_id")
        .populate("tenant_id", "name email");
    }

    res.json(lease);
  } catch (err) {
    res.status(500).json(err.message);
  }
};
