const mongoose = require('mongoose');
const purchasedPlanSchema = new mongoose.Schema({
    plan: Object,
    userCount: String,
    durationCount: String,
    totalPayment: String,
    startDate: String,
    endDate: String,
    planPurchaseDate: String,
    companyID: { type: mongoose.Schema.Types.ObjectId, ref: "AdminInfo" },
    status: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('PurchasedPlan', purchasedPlanSchema);