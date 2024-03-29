const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const lead_model = new Schema(
  {
    company_id: {
      type: String,
      default: "",
    },
    leadName: {
      type: String,
      default: "",
    },
    displayName: {
      type: String,
      default: "",
    },
    deal_value: {
      type: String,
      default: "",
    },
    mobileNumber: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    leadSource: {
      type: String,
      default: "",
    },
    lead_stage: {
      type: String,
      default: "Open",
    },
    customer_grp: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "",
    },
    lead_potential: {
      type: String,
      default: "",
    },
    state_name: String,
    city_name: String,
    // addBy:{
    //     type:String,
    //     default: ""
    // },
    note: {
      type: String,
      default: "",
    },
    assignToEmp: {
      type: String,
      default: "",
    },
    Created_date: {
      type: String,
      default: "",
    },
    Updated_date: {
      type: String,
      default: "",
    },
    is_delete: {
      type: String,
      default: "0",
    },
    last_followup: {
      type: Date,
      default: Date.now,
    },
    next_followup: {
      type: Date,
      default: Date.now,
    },
    // follow_up: { type: followUpSchema },
    status: {
      type: String,
      default: "InActive",
    },
    is_customer: {
      type: String,
      default: "0",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", lead_model);
