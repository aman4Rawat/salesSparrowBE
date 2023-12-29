const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadBanner_model = new Schema({
    company_id:{
        type:String,
        default: ""
    },
    type:{
        type:String,
        default: ""
    },
    name:{
        type:String,
        default: ""
    },
    date:{
        type:String,
        default: ""
    },
    file:{
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

module.exports = mongoose.model('LeadBanner',leadBanner_model)