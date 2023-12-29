const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employee_schema = new Schema({
    employeeName:{
        type:String,
        require:true
    },
    otp:{
        type:String
    },
    companyId:{
        type:String
    },
    headquarterState:{
        type:String
    },
    headquarterCity:{
        type:String
    },
    roleId:{
        type:String,
    },
    esi_no:{
        type:String
    },
    pf_no:{
        type:String
    },
    account_no:{
        type:String
    },
    ifsc_code:{
        type:String
    },
    bank_name:{
        type:String,
    },
    manager:{
        type:String,
    },
    country:{
        type:String,
    },
    phone:{
        type:Number
    },
    email:{
        type:String,
    },
    address:{
        type:String,
        default: ""
    },
    company_code:{
        type:String,
        default:""
    },
    employee_code:{
        type:Number,
        default:0
    },
    is_login:{
        type:Boolean,
        default:false
    },
    pincode:{
        type:Number,
        default: ""
    },
    state:{
        type:String
    },
    device_id:{
        type:String,
        default:""
    },
    image:{
        type:String
    },
    deviceToken:{
        type:String,
        default:""
    },
    city:{
        type:String
    },
    team_view:{
        type:Boolean,
        default:true
    },
    gps_alarm:{
        type:Boolean,
        default:true
    },
    track_user:{
        type:Boolean,
        default:true
    },
    // district:{
    //     type:String
    // },
    experience:{
        type:String,
        default: ""
    },
    qualification:{
        type:String,
        default: ""
    },
    userExpenses:{
        type:Object,
    },
    transportWays:{
        type:Object,
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

module.exports = mongoose.model('Employee',employee_schema)