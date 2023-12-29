const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendance_schema = new Schema({
    emp_id:{
        type:String
    },
    party_id_arr:{
        type:Array
    },
    beat_id:{
        type:String
    },
    date:{
        type:Date
    },
    activity_id:{
        type:String
    },
    lat:{
        type:String,
    },
    long:{
        type:String
    },
    date2:{
        type:String
    },
    selfie:{
        type:String
    },
    location:{
        type:Array,
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

module.exports = mongoose.model('Attendance',attendance_schema)