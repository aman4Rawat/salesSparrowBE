const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const claim_schema = new Schema({
    emp_id:{
        type:String
    },
    company_id:{
        type:String
    },
    party_type_id:{
        type:String
    },
    party_id:{
        type:String
    },
    claim_date:{
        type:String
    },
    claim_amount:{
        type:String
    },
    claim_type:{
        type:String,  //credit
    },
    description:{
        type:String
    },
    document:{
        type:String
    },
    approval_status:{
        type:String,
        default:"Pending"
    },
    approved_amount:{
        type:String,
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
})

module.exports = mongoose.model('Claim',claim_schema)