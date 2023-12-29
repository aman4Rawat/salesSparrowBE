const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const new_unit_schema = new Schema({
    company_id:{
        type:String,
    },
    unit:{
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
});

module.exports = mongoose.model('Unit',new_unit_schema)