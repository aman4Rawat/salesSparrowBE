const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employee_target_schema = new Schema({
    state_id:{
        type:String
    },
    state_name:{
        type:String
    },
    city_id:{
        type:String
    },
    city_name:{
        type:String
    },
    company_id:{
        type:String
    },
    company_name:{
        type:String
    },
    target_status:{
        type:String,
        default:"Pending"
    },
    employee_id:{
        type:String
    },
    employee_name:{
        type:String
    },
    month:{
        type:String
    },
    created_by:{
        type:String
    },
    total_visit:{
        type:String
    },
    total_secondary:{
        type:String
    },
    total_primary:{
        type:String
    },
    year:{
        type:String
    },
    target:{
        type:Array,
    },
    Created_date: {
        type: Date,
        default: new Date()
    },
    Updated_date: {
        type: Date,
        default: new Date()
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

module.exports = mongoose.model('EmployeeTarget',employee_target_schema)