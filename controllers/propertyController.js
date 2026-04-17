const Property = require("../models/Property");

// Create Property (Landlord only)
exports.createProperty = async (req, res) => {
  try {
    const { title, address, price } = req.body;

    // ✅ Cloudinary gives URL in req.file.path
    const image = req.file?.path || "";

    const property = await Property.create({
      title,
      address,
      price,
      coverImage: image, // ✅ match frontend
      landlord_id: req.user.id,
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

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      landlord_id: req.user.id,
    }).sort({ createdAt: -1 }); // newest first

    res.json(properties);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Get Single Property
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    res.json(property);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Delete Property
exports.deleteProperty = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);

    res.json("Property deleted");
  } catch (error) {
    res.status(500).json(error.message);
  }
};
