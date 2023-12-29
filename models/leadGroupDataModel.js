const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadGroupData_model = new Schema({
    company_id:{
        type:String,
        default: ""
    },
    grp_id:{
        type:String,
        default: ""
    },
    lead_id:{
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

module.exports = mongoose.model('LeadGroupItem',leadGroupData_model)