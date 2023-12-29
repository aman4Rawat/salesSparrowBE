const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const new_primary_order_schema = new Schema({
    emp_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    party_type_id:{
        type:String,
    },
    date:{
        type:String,
    },
    party_id:{
        type:String,
    },
    supply_by:{
        type:String,
    },
    supply_by_id:{
        type:String,
    },
    total_amount:{
        type:String,
    },
    approval_status:{
        type:String,
        default:"Pending"
    },
    delivery_status:{
        type:String,
        default:"Pending"
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

module.exports = mongoose.model('PrimaryOrder',new_primary_order_schema)