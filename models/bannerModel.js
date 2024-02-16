const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const banner_model = new Schema({
    banner_name: { type: String, required: [true, "banner name is required!"] },
    category_name: { type: String, required: [true, "category name is required!"] },
    banner_image: { type: String, default: "" },
    logo_position: { type: String, required: [true, "logo position is required!"] },
    size: { type: String, required: [true, "size is required!"] },
    status: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Banner', banner_model)