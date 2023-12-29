const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    rolename:{
        type:String,
        default:""
    },
    company_id:{
        type:String,
    },
    hierarchy_level:{
        type:Number,
        default: "0"
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

module.exports = mongoose.model('role',roleSchema)