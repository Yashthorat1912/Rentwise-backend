const mongoose = require("mongoose");

const requestFileSchema = new mongoose.Schema({
  request_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MaintenanceRequest",
  },

  file_url: String,
});

module.exports = mongoose.model("RequestFile", requestFileSchema);
