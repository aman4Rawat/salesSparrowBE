const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const night_stay_schema = new Schema({
    emp_id:{
        type:String
    },
    company_id:{
        type:String
    },
    emp_name:{
        type:String
    },
    hotel_name:{
        type:String
    },
    address:{
        type:String
    },
    location:{
        type:String
    },
    selfie:{
        type:String
    },
    date:{
        type:String
    },
    date2:{
        type:Date
    },
    status:{
        type:String,
        default:"InActive"
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
    }
});
module.exports = mongoose.model('NightStay',night_stay_schema)