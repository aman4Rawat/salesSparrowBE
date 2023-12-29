const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const location_schema = new Schema({
    name:{
        type:String
    },
    // // superp_id:{
    // //     type:String
    // // },
    country_id:{
        type:String
    },
    subP_id:{
        type:String
    },
    P_id:{
        type:String
    },
    id:{
        type:String
    },
    // id:{
    //     type:String,
    // },
    // name:{
    //     type:String,
    // },
    // states:{
    //     type:Array,
    // },
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
module.exports = mongoose.model('Location',location_schema)