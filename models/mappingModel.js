const mongoose = require("mongoose")

const mapping_schema = mongoose.Schema({
    primary_id:{
        type:String,
    },
    primary_type:{
        type:String,
    },
    assigned_to_id:{
        type:String,
    },
    company_id:{
        type:String,
    },
    assigned_to_type:{
        type:String,
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
})

module.exports  = mongoose.model('Mapping',mapping_schema)