const Lease = require("../models/Lease");
const Property = require("../models/Property");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

// ✅ CREATE LEASE
exports.createLease = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { property_id, tenant_id, start_date, end_date, rent_amount } =
      req.body;

    const lease = await Lease.create({
      property_id,
      tenant_id,
      landlord_id: req.user.id,
      start_date,
      end_date,
      rent_amount,
      lease_document_url: req.file ? req.file.path : "",
    });

    // ✅ GET RELATED DATA
    const property = await Property.findById(property_id);
    if (!property) return res.status(404).json("Property not found");

    const tenant = await User.findById(tenant_id);
    if (!tenant) return res.status(404).json("Tenant not found");

    const landlord = await User.findById(req.user.id);

    // ✅ 🔔 NOTIFY TENANT (MOST IMPORTANT)
    await sendNotification({
      userId: tenant._id,
      token: tenant?.fcmToken,
      type: "PROPERTY_UPDATE",
      title: "New Lease Assigned",
      body: `You have been assigned a lease for ${property.title}`,
      meta: {
        leaseId: lease._id,
        propertyId: property._id,
      },
    });

    // ✅ 🔔 OPTIONAL: CONFIRM TO LANDLORD
    await sendNotification({
      userId: landlord._id,
      token: landlord?.fcmToken,
      type: "PROPERTY_UPDATE",
      title: "Lease Created",
      body: `Lease created for ${tenant.name}`,
      meta: {
        leaseId: lease._id,
        propertyId: property._id,
      },
    });

    res.json(lease);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
};

// ✅ GET MY LEASE
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
