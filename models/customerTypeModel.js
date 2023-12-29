const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customer_type_schema = new Schema({
    customer_type:{
        type:String,
    },
    level:{
        type:String,
    },
    company_id:{
        type:String,
        default: ""
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

module.exports = mongoose.model('CustomerType',customer_type_schema)