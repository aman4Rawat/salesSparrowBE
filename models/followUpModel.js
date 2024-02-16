const mongoose = require("mongoose");

const followUp_Schema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Please provide type"],
      enum: ["PHONE", "NOTE", "MEETING", "MESSAGE"],
    },
    description: String,
    date: {
      type: String,
      required: [true, "Please provide date"],
    },
    time: {
      type: String,
      required: [true, "Please provide time"],
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide assignee data"],
      ref: "Lead",
    },
    dateAndTime: {
      type: Date,
      required: true
    },
    company_id: {
      type: String,
      default: "",
    },
    admin: {
      type: String,
      default: "",
    },
    is_delete: {
      type: String,
      default: "0",
    },
    created_date: {
      type: Date,
      default: Date.now(),
    },
    update_date: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FollowUp", followUp_Schema);
