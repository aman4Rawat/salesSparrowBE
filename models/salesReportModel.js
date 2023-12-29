const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const salesReportSchema = new Schema({
    tc:{
        type:String
    },
    pc:{
        type:String
    },
    sales_amount:{
        type:String
    },
    employee_id:{
        type:String
    },
    company_id:{
        type:String
    },
    sales_report_date:{
        type:String
    },
    sales_report_time:{
        type:Date,
        default:new Date()
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

module.exports = mongoose.model('SalesReport',salesReportSchema)