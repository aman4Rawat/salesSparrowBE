const mongoose = require("mongoose");

const salary_percentage_schema = new mongoose.Schema({
    company_id:{
        type:String,
    },
    basic_salary_percentage:{
        type : Number ,
    },
    hra_allowance_percentage:{
        type : Number ,
    },
    others_percentage:{
        type : Number ,
    },
    pf_percentage:{
        type : Number ,
    },
    esi_percentage:{
        type : Number ,
    },
    professional_tax_percentage:{
        type : Number ,
    },
    tds_percentage:{
        type : Number ,
    },
    created_date:{
        type : Date,
        default : new Date()
    },
    updated_date:{
        type : Date,
        default : new Date()
    }
});

module.exports = mongoose.model("SalaryPercentage",salary_percentage_schema)