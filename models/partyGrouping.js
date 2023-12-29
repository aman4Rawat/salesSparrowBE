const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const party_grouping_schema = new Schema({
    grp_id:{
        type:String,
    },
    party_id:{
        type:String,
    },
    company_id:{
        type:String
    },
    partyName:{
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

module.exports = mongoose.model('PartyGrouping',party_grouping_schema)
