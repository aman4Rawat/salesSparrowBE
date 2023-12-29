const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const good_detail_schema = new Schema({
    catagory_id:{
        type:String
    },
    product:{
        type:String
    },
    distributor_id:{
        type:String
    },
    return_quantity:{
        type:Number
    },
    amount:{
        type:Number
    },
    order_invoice:{
        type:String
    },
    return_date:{
        type:String
    },
    return_reason:{
        type:String
    },
    saleman_id:{
        type:String
    },
    depriciation:{
        type:Number
    },
    description:{
        type:String
    },
    image:{
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

module.exports = mongoose.model('GoodDetails',good_detail_schema)