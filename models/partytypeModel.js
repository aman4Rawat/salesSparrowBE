const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const party_type_schema = new Schema({
    party_type:{
        type:String,
    },
    level:{
        type:Number,
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

module.exports = mongoose.model('PartyType',party_type_schema)