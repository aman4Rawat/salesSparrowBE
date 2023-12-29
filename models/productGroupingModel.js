const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const product_grouping_schema = new Schema({
    grp_id:{
        type:String,
    },
    product_id:{
        type:String,
    },
    company_id:{
        type:String
    },
    productName:{
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

module.exports = mongoose.model('ProductGrouping',product_grouping_schema)
