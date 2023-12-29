const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visit_schema = new Schema({
    emp_id:{
        type:String,
    },
    beat_id:{
        type:String,
    },
    retailer_id:{
        type:String,
    },
    visit_status:{
        type:String,
    },
    visit_date:{
        type:String,
    },
    visit_time:{
        type:Date,
    },
    no_order_reason:{
        type:String,
        default: ""
    },
    order_status:{
        type:String,
        default: ""
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
},{strict:false});

module.exports = mongoose.model('Visit',visit_schema)