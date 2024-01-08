const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const catalogueTrendingProductModel = new Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    priority: {
        type: String, default: "1",
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CatalogueTrendingProduct = mongoose.model('CatalogueTrendingProduct', catalogueTrendingProductModel)
module.exports = CatalogueTrendingProduct;