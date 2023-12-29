const mongoose = require("mongoose");
const { DependentPhoneNumberList } = require("twilio/lib/rest/api/v2010/account/address/dependentPhoneNumber");
const Schema = mongoose.Schema;

const retailer_schema = new Schema({
    // beat_id:{
    //     type:String,
    // },
    customer_type:{
        type:String,
    },
    company_id:{
        type:String,
    },
    employee_id:{
        type:String,
    },
    pincode:{
        type:Number
    },
    address:{
        type:String
    },
    firmName:{
        type:String
    },
    GSTNo:{
        type:String
    },
    customerName:{
        type:String
    },
    // area:{
    //     type:String
    // },
    lat:{
        type:Number,
    },
    long:{
        type:Number,
    },
    route_id:{
        type:String
    },
    mobileNo:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    DOB:{
        type:String
    },
    date:{
        type:String
    },
    DOA:{
        type:String
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

module.exports = mongoose.model('Retailer',retailer_schema)