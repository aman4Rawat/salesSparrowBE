const mongoose = require("mongoose");

const demoSchema = new mongoose.Schema({
    name:{
        type:String,
        default:"",
        required:true,
    },
    image:{
        type:String,
        default:""
    },
    date:{
        type:String,
    },
    created_date:{
        type:Date,
        default:new Date()
    }
});

module.exports = mongoose.model('demo',demoSchema)
