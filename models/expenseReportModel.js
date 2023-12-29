const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenseReportSchema = new Schema({
    employee_id:{
        type:String
    },
    company_id:{
        type:String
    },
    ta_amount:{
        type:String
    },
    da_amount:{
        type:String
    },
    stationary:{
        type:String
    },
    hotel:{
        type:String
    },
    from_location:{
        type:String
    },
    to_location:{
        type:String
    },
    misc_amount:{
        type:String
    },
    total_claim_amount:{
        type:String
    },
    attachment:{
        type:String
    },
    submit_date:{
        type:String
    },
    submit_time:{
        type:Date,
        default:new Date()
    },
    approval_status:{
        type:String,
        default:"Pending"
    },
    approved_amount:{
        type:String,
        default:""
    },
    device_kms:{
        type:String,
        default:""
    },
    travelled_distance:{
        type:String
    },
    for_what_date:{
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
});

module.exports = mongoose.model('ExpenseReport',expenseReportSchema)