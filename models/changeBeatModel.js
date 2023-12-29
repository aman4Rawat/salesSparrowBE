const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const beat_change_schema = new Schema({
    emp_id:{
        type:String
    },
    beat_id:{
        type:String
    },
    reason:{
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
})

module.exports = mongoose.model('beatChange',beat_change_schema)