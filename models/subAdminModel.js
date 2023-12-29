var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subAdminSchema = new Schema({
    name:{
        type:String,
        required:'This is mendatory',
    },
    phone:{
        type:String,
        required:'This is mendatory',
    },
    password:{
        type:String,
        default:""
    },
    company_id:{
        type:String
    },
    email:{
        type:String,
        default:""
    },
    role:{
        type:String,
        default:""
    },
    // district:{
    //     type:String,
    //     default:""
    // },
    city:{
        type:String,
        default:""
    },
    state:{
        type:String,
        default:""
    },
    pincode:{
        type:Number,
        default:""
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
},{strict:false});
 module.exports = mongoose.model('subAdminInfo',subAdminSchema);