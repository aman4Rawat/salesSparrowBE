const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const new_order_schema = new Schema({
    emp_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    retailer_id:{
        type:String,
    },
    beat_id:{
        type:String,
    },
    order_date:{
        type:String,
    },
    type:{
        type:String,
    },
    order_status:{
        type:String,
    },
    delivery_status:{
        type:String,
        default:"Pending"
    },
    total_amount:{
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

module.exports = mongoose.model('Order',new_order_schema)