const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const catalogueCategoryModel = new Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCatagory",
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    banner_img: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CatalogueCategory = mongoose.model('CatalogueCategory', catalogueCategoryModel)
module.exports = CatalogueCategory;