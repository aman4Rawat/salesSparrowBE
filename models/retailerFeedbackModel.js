const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedback_schema = new Schema({
    beat_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    employee_id:{
        type:String,
    },
    employee_name:{
        type:String,
    },
    route_id:{
        type:String,
    },
    route_name:{
        type:String,
    },
    customer_id:{
        type:String,
    },
    customer_name:{
        type:String,
    },
    retailer_id:{
        type:String,
    },
    retailer_name:{
        type:String,
    },
    complaint:{
        type:String,
    },
    suggestion:{
        type:String,
    },
    beat_name:{
        type:String,
    },
    date:{
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
},{strict:false});

module.exports = mongoose.model('Feedback',feedback_schema)