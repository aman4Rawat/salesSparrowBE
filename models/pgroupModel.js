const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const party_grp_schema = new Schema({
    grp_name:{
        type:String,
    },
    grp_description:{
        type:String,
    },
    state:{
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

module.exports = mongoose.model('PGroup',party_grp_schema)
