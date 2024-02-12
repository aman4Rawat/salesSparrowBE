const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const catalogueBannerModel = new Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    image: {
        type: String
    },
    priority: {
        type: String, default: "1",
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CatalogueBanner = mongoose.model('CatalogueBanner', catalogueBannerModel)
module.exports = CatalogueBanner;