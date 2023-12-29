const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    company_id:{
        type:String
    },
    employee_id:{
        type:String
    },
    date:{
        type:String
    },
    time:{
        type:Date,
        default:new Date()
    },
    title:{
        type:String
    },
    body:{
        type:String
    },
    is_delete:{
        type:String,
        default:"0"
    }
});

module.exports = mongoose.model('Notification',notificationSchema)