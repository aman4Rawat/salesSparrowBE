const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leave_schema = new Schema({
    emp_id:{
        type:String
    },
    company_id:{
        type:String
    },
    type:{
        type:String
    },
    reason:{
        type:String
    },
    specific_reason:{
        type:String
    },
    emp_name:{
        type:String
    },
    date1:{
        type:String
    },
    date2:{
        type:String
    },
    date:{
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
module.exports = mongoose.model('Leave',leave_schema)