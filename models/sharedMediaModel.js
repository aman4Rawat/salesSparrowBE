const mongoose = require("mongoose");

const shareBy = new mongoose.Schema({
  _id: String,
  by: {
    type: String,
    enum: ["EMPLOYEE", "COMPANY"],
  },
});
const sharedMedia_Model = new mongoose.Schema({
  sharedBy: shareBy,
  userType: {
    type: String,
    required: true,
    enum: ["Lead", "Party", "Retailer"],
  },
  sharedWith: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userType",
  },
  opened: {
    type: Boolean,
    default: false,
  },
  unopened: {
    type: Boolean,
    default: true,
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  openCount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    required: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
});

module.exports = mongoose.model("SharedMedia", sharedMedia_Model);
