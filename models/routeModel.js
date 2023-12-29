const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const route_schema = new Schema({
    state:{
        type:String,
    },
    city:{
        type:String,
    },
    route_name:{
        type:String,
    },
    is_assigned:{
        type:String,
        default:"0"
    },
    assigned_to:{
        type:String,
        default:""
    },
    start_point:{
        type:String,
    },
    company_id:{
        type:String,
    },
    end_point:{
        type:String,
    },
    distance:{
        type:String,
    },
    is_mapped:{
        type:Boolean,
        default:false
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

module.exports = mongoose.model('Route',route_schema)