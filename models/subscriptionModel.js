const mongoose = require('mongoose');
const SubscriptionPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  ems: {
    mrp: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: { type: Number },
    duration: { type: Number, default: 12 },
    minUsers: {
      type: Number,
      default: 30,
    },
    modules: [{ type: String }],
  },
  dms: {
    minUsers: { type: Number },
    duration: { type: Number },
    price: { type: Number },
    totalPrice: { type: Number },
  },
});

module.exports = mongoose.model('subs', SubscriptionPlanSchema);