const mongoose = require('mongoose');
const PurchaseSubscriptionPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  company_id: {
    type: String,
  },
  ems: {
    mrp: {
      type: Number,
    },
    price: {
      type: Number,
    },
    totalPrice: { type: Number },
    duration: { type: Number, default: 12 },
    users: {
      type: Number,
      default: 30,
    },
    modules: [{ type: String }],
    start_date_ems: { type: String },
      end_date_ems: { type: String },
  },
  dms: {
    users: { type: Number },
    duration: { type: Number },
    price: { type: Number },
    totalPrice: { type: Number },
    start_date_dms: { type: String },
    end_date_dms: { type: String },
},
status:{
    type:String
}
});

module.exports = mongoose.model('Purchase', PurchaseSubscriptionPlanSchema);