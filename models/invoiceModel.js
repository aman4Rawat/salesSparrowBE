const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoice_schema = new Schema({
    emp_name:{
        type:String,
    },
    company_id:{
        type:String,
    },
    party_id:{
        type:String,
    },
    order_amount:{
        type:String,
    },
    invoice_amount:{
        type:String,
    },
    supply_by:{
        type:String,
    },
    supply_by_id:{
        type:String,
    },
    order_id:{
        type:String,
    },
    party_name:{
        type:String,
    },
    tax_type:{
        type:String,
    },
    state:{
        type:String,
    },
    partyType:{
        type:String,
    },
    partyTypeName:{
        type:String,
    },
    ewaybill_no:{
        type:String,
    },
    total_nug:{
        type:String,
    },
    transporter_name:{
        type:String,
    },
    vehicle_no:{
        type:String,
    },
    invoice_no:{
        type:String,
    },
    product_list:{
        type:Array,
    },
    tax:{
        type:Array,
    },
    order_date:{
        type:String
    },
    invoice_date:{
        type:String
    },
    phone:{
        type:String
    },
    email:{
        type:String
    },
    address:{
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

module.exports = mongoose.model('Invoice',invoice_schema)