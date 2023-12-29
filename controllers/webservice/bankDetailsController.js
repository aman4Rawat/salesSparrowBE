const express = require("express");
const mongoose = require("mongoose");
const BankDetails = mongoose.model("BankDetails")
const router = express.Router();

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addBankDetails',(req,res)=>{
    var branch_name = req.body.branch_name?req.body.branch_name:"";
    var bank_name = req.body.bank_name?req.body.bank_name:"";
    var account_number = req.body.account_number?req.body.account_number:"";
    var IFSC_code = req.body.IFSC_code?req.body.IFSC_code:"";
    if(branch_name!=""){
        if(bank_name!=""){
            if(account_number!=""){
                if(IFSC_code!=""){
                    BankDetails.find({account_number}).exec().then(bank_details_data=>{
                        if(bank_details_data.length<1){
                            var new_bank_details = new BankDetails({
                                branch_name:branch_name,
                                bank_name:bank_name,
                                account_number:account_number,
                                IFSC_code:IFSC_code,
                                status:"Active",
                                Created_date:get_current_date(),
                                Updated_date:get_current_date()
                            });
                            new_bank_details.save().then(data=>{
                                res.status(200).json({
                                    status:true,
                                    message:"Details Saved Successfully",
                                    details:data
                                });
                            })
                        }else{
                            res.json({
                                status:false,
                                message:"Account Number already exist .Please check yours."
                            })
                        }
                    })
                }else{
                    res.json({
                        status:false,
                        message:"IFSC Code is required"
                    });
                }
            }else{
                res.json({
                    status:false,
                    message:"Account number is required"
                });
            }
        }else{
            res.json({
                status:false,
                message:"Bank Name is required"
            });
        }
    }else{
        res.json({
            status:false,
            message:"Branch Name is required"
        });
    }
});

router.get('/getAllBankDetails',(req,res)=>{
    BankDetails.find().exec().then(bank_details_data=>{
        res.status(200).json({
            status:true,
            message:"All Bank details",
            result:bank_details_data
        })
    })
});

router.get('/getBankDetails',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    BankDetails.find({_id:id}).exec().then(bank_details_data=>{
        res.status(200).json({
            status:true,
            message:"Bank details",
            result:bank_details_data
        })
    })
});

module.exports = router;
