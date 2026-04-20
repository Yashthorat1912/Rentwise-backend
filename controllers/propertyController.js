const Property = require("../models/Property");
const User = require("../models/User");
const Lease = require("../models/Lease");
const sendNotification = require("../utils/sendNotification");

// ✅ Create Property (Landlord only)
exports.createProperty = async (req, res) => {
  try {
    const { title, address, price } = req.body;

    const image = req.file?.path || "";

    const property = await Property.create({
      title,
      address,
      price,
      coverImage: image,
      landlord_id: req.user.id,
    });

    // ✅ 🔔 NOTIFY LANDLORD (confirmation)
    const landlord = await User.findById(req.user.id);

    await sendNotification({
      userId: landlord._id,
      token: landlord?.fcmToken,
      type: "PROPERTY_UPDATE",
      title: "Property Created",
      body: `${title} has been added successfully`,
      meta: {
        propertyId: property._id,
      },
    });

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

// ✅ Get All Properties
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      landlord_id: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// ✅ Get Single Property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    res.json(property);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// ✅ Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json("Property not found");
    }

    await Property.findByIdAndDelete(req.params.id);

    // ✅ 🔔 NOTIFY LANDLORD
    const landlord = await User.findById(property.landlord_id);

    await sendNotification({
      userId: landlord._id,
      token: landlord?.fcmToken,
      type: "PROPERTY_UPDATE",
      title: "Property Deleted",
      body: `${property.title} has been removed`,
      meta: {
        propertyId: property._id,
      },
    });

    // ✅ OPTIONAL: Notify tenants (if any active lease exists)
    const lease = await Lease.findOne({ property_id: property._id });

    if (lease) {
      const tenant = await User.findById(lease.tenant_id);

      if (tenant) {
        await sendNotification({
          userId: tenant._id,
          token: tenant?.fcmToken,
          type: "PROPERTY_UPDATE",
          title: "Property Removed",
          body: "The property you are associated with has been removed",
          meta: {
            propertyId: property._id,
            leaseId: lease._id,
          },
        });
      }
    }

    res.json("Property deleted");
  } catch (error) {
    res.status(500).json(error.message);
  }
};
