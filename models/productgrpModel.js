const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const product_grp_schema = new Schema({
    grp_name:{
        type:String,
    },
    grp_description:{
        type:String,
    },
    catagory_id:{
        type:String,
    },
    company_id:{
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

module.exports = mongoose.model('ProductGroup',product_grp_schema)
