const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leadfollow_model = new Schema({
    lead_id:{
        type:String,
        default: ""
    },
     admin_id:{
        type:String,
        default: ""
    },
    phone_call:{
        type:String,
        default: ""
    },
    message:{
        type:String,
        default: ""
    },
    meeting:{
        type:String,
        default: ""
    },
    note:{
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

module.exports = mongoose.model('leadfollow',leadfollow_model)