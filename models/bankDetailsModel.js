const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bank_details_schema = new Schema({
    branch_name:{
        type:String
    },
    bank_name:{
        type:String,
    },
    account_number:{
        type:String
    },
    IFSC_code:{
        type:String
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

module.exports = mongoose.model('BankDetails',bank_details_schema)