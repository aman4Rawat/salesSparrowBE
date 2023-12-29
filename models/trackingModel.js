const mongoose = require("mongoose")

const tracking_schema = new mongoose.Schema({
    emp_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    location:{
        type:Array,
    },
    current_location:{
        type:Object,
    },
    date:{
        type:String,
    },
    // location_name:{
    //     type:String,
    // },
    Created_date: {
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
    },
    updated_date:{
        type:Date,
        default:new Date(),
    }
})

module.exports = mongoose.model('Tracking',tracking_schema)