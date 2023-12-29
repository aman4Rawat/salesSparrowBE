const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const country_schema = new Schema({
    name:{
        type:String
    },
    id:{
        type:String
    },
    status:{
        type:String,
        default:"InActive"
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
    }
});
module.exports = mongoose.model('Country',country_schema)