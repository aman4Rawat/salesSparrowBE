const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const payment_collection_Schema = new Schema({
    employee_id:{
        type:String
    },
    company_id:{
        type:String
    },
    party_type_id:{
        type:String
    },
    party_id:{
        type:String
    },
    amount:{
        type:String
    },
    payment_mode:{
        type:String
    },
    bank_name:{
        type:String
    },
    date:{
        type:String
    },
    approval_status:{
        type:String,
        default:"Pending"
    },
    approved_amount:{
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

module.exports = mongoose.model('PaymentCollection',payment_collection_Schema)