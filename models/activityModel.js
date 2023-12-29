const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activity_schema = new Schema({
    activity:{
        type:String,
    },
    company_id:{
        type:String,
        default: ""
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

module.exports = mongoose.model('Activity',activity_schema)
