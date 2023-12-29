const mongoose = require("mongoose")

const device_status_schema = new mongoose.Schema({
    emp_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    gps:{
        type:String,
    },
    internet:{
        type:String,
    },
    battery:{
        type:String,
    },
    emp_name:{
        type:String,
    },
    assigned_state_id:{
        type:String,
    },
    assigned_state:{
        type:String,
    },
    mobile:{
        type:String,
    },
    mobileName:{
        type:String,
    },
    androidVersion:{
        type:String,
    },
    appVersion:{
        type:String,
    },
    date:{
        type:String,
    },
    date2:{
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

module.exports = mongoose.model('DeviceStatus',device_status_schema)