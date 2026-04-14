const Property = require("../models/Property");

// Create Property (Landlord only)
exports.createProperty = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const property = await Property.create({
      title: req.body.title,
      address: req.body.address,
      price: req.body.price,
      image: req.file ? req.file.path : "",
      landlord_id: req.user.id,
    });

    res.json(property);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json(error.message);
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
