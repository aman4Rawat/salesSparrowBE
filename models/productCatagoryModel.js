const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const product_catagory_model = new Schema({
    name:{
        type:String
    },
    // p_id:{
    //     type:String,
    //     default: ""
    // },
    gst:{
        type:String
    },
    image:{
        type:String
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

module.exports = mongoose.model('ProductCatagory',product_catagory_model)