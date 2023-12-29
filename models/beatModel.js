const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const beat_schema = new Schema({
    beatName:{
        type:String,
    },
    employee_id:{
        type:String,
    },
    day:{
        type:String,
    },
    state:{
        type:String,
    },
    city:{
        type:String,
    },
    company_id:{
        type:String,
    },
    route:{
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
});

module.exports = mongoose.model('Beat',beat_schema)
