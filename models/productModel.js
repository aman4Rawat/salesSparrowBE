const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const product_model = new Schema({
    catagory_id:{
        type:String,
        default:""
    },
    // sub_catagory_id:{
    //     type:String,
    //     default:""
    // },
    productName:{
        type:String
    },
    hsn_code:{
        type:String
    },
    description:{
        type:String
    },
    company_id:{
        type:String
    },
    mrp:{
        type:String
    },
    price:{
        type:String
    },
    packing_details:{
            type:Array
    },
    sku_id:{
        type:String,
        default: ""
    },
    gst:{
        type:String
    },
    display_image:{
        type:String
    },
    brand_id:{
        type:String
    },
    // tax:{
    //     type:Number
    // },
    // SKU_ID:{
    //     type:String
    // },
    // HSN_Code:{
    //     type:String
    // },
    // productImage:{
    //     type:String
    // },
    // pricing_details:{
    //     type:Array,
    // },
    // packing_details:{
    //     type:Array
    // },
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

module.exports = mongoose.model('Product',product_model)