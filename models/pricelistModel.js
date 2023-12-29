const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pricelist_schema = new Schema({
    price_list_name:{
        type:String
    },
    pricelist_details:{
        type:Array
    },
    company_id:{
        type:String
    },
    party_type_two:{
        type:Object
    },
    party_type_one:{
        type:Object
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

module.exports = mongoose.model('PriceList',pricelist_schema)
