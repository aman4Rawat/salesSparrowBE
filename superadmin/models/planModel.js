const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        plan_name: { type: String, enum: ['sfa', 'dms', 'lead_management',], default: 'sfa', },
        cost_per_user_per_month: { type: String, required: [true, "cost_per_user_per_month is required!"] },
        billing_frequency: { type: String, enum: ['monthly', 'annually',], required: [true, "billing_frequency is required!"] },
        discount: { type: String, default: "0" },
        minimum_user: { type: String, required: [true, "minimum_user is required!"] },
        features: { type: String, enum: ["basic", "standard", "premium"], required: [true, "features is required!"] },
        feature_includes: { type: Array, },
        is_deleted: { type: Boolean, default: false },
        status: { type: Boolean, default: true },
    },
    { timestamps: true }
)

const Plan = mongoose.model("plan", planSchema);
module.exports = Plan;