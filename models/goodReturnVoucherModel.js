const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voucher_goods_return_schema = new Schema({
    emp_id:{
        type:String,
    },
    party_type_id:{
        type:String,
    },
    party_id:{
        type:String,
    },
    total_amount:{
        type:String,
    },
    net_amount:{
        type:String,
    },
    total_qty:{
        type:String,
    },
    depriciation:{
        type:String,
    },
    company_id:{
        type:String,
    },
    approval_status:{
        type:String,
        default:"Pending"
    },
    approved_amount:{
        type:String,
    },
    description:{
        type:String,
    },
    date:{
        type:String,
    },
    photo:{
        type:String,
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

module.exports = mongoose.model('VoucherGoodsReturn',voucher_goods_return_schema)