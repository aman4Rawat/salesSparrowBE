const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const new_order_item_schema = new Schema({
    order_id:{
        type:String,
    },
    emp_id:{
        type:String,
    },
    product_id:{
        type:String,
    },
    catagory_id:{
        type:String,
    },
    date:{
        type:String,
    },
    product_price:{
        type:String,
    },
    quantity:{
        type:String,
    },
    discount:{
        type:String,
    },
    sub_total_price:{
        type:String,
    },
    order_status:{
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

module.exports = mongoose.model('OrderItem',new_order_item_schema)