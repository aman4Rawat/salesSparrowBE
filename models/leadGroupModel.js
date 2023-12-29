const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadGroup_model = new Schema({
    company_id:{
        type:String,
        default: ""
    },
    colour:{
        type:String,
        default: ""
    },
    grp_name:{
        type:String,
        default: ""
    },
    date:{
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

module.exports = mongoose.model('LeadGroup',leadGroup_model)