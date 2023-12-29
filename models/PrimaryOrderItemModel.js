const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const new_primary_order_item_schema = new Schema({
    order_id:{
        type:String,
    },
    product_id:{
        type:String,
    },
    product_price:{
        type:String,
    },
    quantity:{
        type:String,
    },
    sub_total_price:{
        type:String,
    },
    hsn_code:{
        type:String,
    },
    discount:{
        type:String,
    },
    Created_date: {
        type: String,
        default: ""
    },
    Updated_date: {
        type: String,
        default: ""
    },
    is_delete: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        default:'InActive'
    }
});

module.exports = mongoose.model('PrimaryOrderItem',new_primary_order_item_schema)