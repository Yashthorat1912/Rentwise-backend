const User = require("../models/User");

exports.getTenants = async (req, res) => {
  try {
    const tenants = await User.find({ role: "tenant" });

    res.json(tenants);
  } catch (error) {
    res.status(500).json(error.message);
  }
};
