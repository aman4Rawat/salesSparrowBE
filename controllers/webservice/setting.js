const mongoose = require("mongoose");
const SalaryPercentage = mongoose.model("SalaryPercentage");
const { extractCompanyId } = require("../../middleware/response")
const express = require("express");
const router = express.Router();

router.post('/add_salary_percentage', extractCompanyId, async (req, res) => {
    const company_id = req.company_id;
    console.log("company_id ------------->", company_id)
    let data = await SalaryPercentage.findById(company_id);
    if (data) {
        let updated_salary_percentage = {};
        if (req.body.basic_salary_percentage) {
            updated_salary_percentage.basic_salary_percentage = req.body.basic_salary_percentage
        }
        if (req.body.hra_allowance_percentage) {
            updated_salary_percentage.hra_allowance_percentage = req.body.hra_allowance_percentage
        }
        if (req.body.others_percentage) {
            updated_salary_percentage.others_percentage = req.body.others_percentage
        }
        if (req.body.pf_percentage) {
            updated_salary_percentage.pf_percentage = req.body.pf_percentage
        }
        if (req.body.esi_percentage) {
            updated_salary_percentage.esi_percentage = req.body.esi_percentage
        }
        if (req.body.professional_tax_percentage) {
            updated_salary_percentage.professional_tax_percentage = req.body.professional_tax_percentage
        }
        if (req.body.tds_percentage) {
            updated_salary_percentage.tds_percentage = req.body.tds_percentage
        }
        try {
            let result = await SalaryPercentage.findByIdAndUpdate({ company_id }, updated_salary_percentage, { new: true });
            return res.json({ status: true, message: "Updated successfully", result: result })
        } catch (err) {
            console.log("There is some error---")
            res.status(400).send(`some error ${err}`);
        }
    } else {
        const {
            basic_salary_percentage,
            hra_allowance_percentage,
            others_percentage,
            pf_percentage,
            esi_percentage,
            professional_tax_percentage,
            tds_percentage
        } = req.body;
        if (!basic_salary_percentage ||
            !hra_allowance_percentage ||
            !others_percentage ||
            !pf_percentage ||
            !esi_percentage ||
            !professional_tax_percentage ||
            !tds_percentage) return res.json({ status: false, message: "Please fill all the fields." })
        let new_document = await SalaryPercentage.create({
            company_id,
            basic_salary_percentage,
            hra_allowance_percentage,
            others_percentage,
            pf_percentage,
            esi_percentage,
            professional_tax_percentage,
            tds_percentage
        });
        return res.json({ status: true, message: "Salary Percentage set successfully" })
    }
})

// router.post('/edit_salary_percentage',extractCompanyId,async(req,res)=>{
//     const company_id = req.company_id;
//     let id = req.body.id?req.body.id:"";
//     if(id == "") return res.json({status:false,message:"Please provide the id"})
//     let updated_salary_percentage = {};
//     if(req.body.basic_salary_percentage){
//         updated_salary_percentage.basic_salary_percentage = req.body.basic_salary_percentage
//     }
//     if(req.body.hra_allowance_percentage){
//         updated_salary_percentage.hra_allowance_percentage = req.body.hra_allowance_percentage
//     }
//     if(req.body.others_percentage){
//         updated_salary_percentage.others_percentage = req.body.others_percentage
//     }
//     if(req.body.pf_percentage){
//         updated_salary_percentage.pf_percentage = req.body.pf_percentage
//     }
//     if(req.body.esi_percentage){
//         updated_salary_percentage.esi_percentage = req.body.esi_percentage
//     }
//     if(req.body.professional_tax_percentage){
//         updated_salary_percentage.professional_tax_percentage = req.body.professional_tax_percentage
//     }
//     if(req.body.tds_percentage){
//         updated_salary_percentage.tds_percentage = req.body.tds_percentage
//     }
//     try{
//         let result = await SalaryPercentage.findByIdAndUpdate({_id:id},updated_salary_percentage,{new:true});
//         return res.json({status:true,message:"Updated successfully",result:result})
//     }catch(err){
//         console.log("There is some error---")
//         res.status(400).send(`some error ${err}`);
//     }
// })

router.get('/get_salary_percentage',extractCompanyId,async(req,res)=>{
    const company_id = req.company_id;
    try {
        let data = await SalaryPercentage.findOne({company_id});
        if(data){
            return res.json({status:true,message:"Data",result:data})
            
        }else{
            return res.json({status:true,message:"No Data",result:{
                basic_salary_percentage: "",
                hra_allowance_percentage: "",
                others_percentage: "",
                pf_percentage: "",
                esi_percentage: "",
                professional_tax_percentage: "",
                tds_percentage: "",
            }})

        }
    }catch(err){
        console.log("Some error----",err);
        res.status(400).send(`Some error ---- ${err}`)
    }
});

module.exports = router;