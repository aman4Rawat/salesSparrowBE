const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailed_goods_return_schema = new Schema({
    emp_id:{
        type:String,
    },
    party_type_id:{
        type:String,
    },
    party_id:{
        type:String,
    },
    goods_return_date:{
        type:String,
    },
    total_amount:{
        type:String,
    },
    net_amount:{
        type:String,
    },
    deprication:{
        type:String,
    },
    company_id:{
        type:String,
    },
    approval_status:{
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

module.exports = mongoose.model('DetailedGoodsReturn',detailed_goods_return_schema)