const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const party_schema = new Schema({
    partyType:{
        type:String,
    },
    image:{
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
    state:{
        type:String
    },
    address1:{
        type:String
    },
    address2:{
        type:String
    },
    city:{
        type:String
    },
    // district:{
    //     type:String
    // },
    firmName:{
        type:String
    },
    document:{
        type:Array,
    },
    GSTNo:{
        type:String
    },
    contactPersonName:{
        type:String
    },
    mobileNo:{
        type:Number
    },
    company_code:{
        type:String
    },
    party_code:{
        type:Number
    },
    email:{
        type:String
    },
    DOB:{
        type:String
    },
    DOA:{
        type:String
    },
    route:{
        type:Array
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
    is_mapped: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default:'InActive'
    }
},{strict:false});

module.exports = mongoose.model('Party',party_schema)