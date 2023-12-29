const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const card_schema = new Schema({
    card_holder_name:{
        type:String,
    },
    card_number:{
        type:String,
    },
    expiry_date:{
        type:Date
    },
    status:{
        type:String,
        default:"InActive"
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
    }
});

module.exports = mongoose.model('Card',card_schema)