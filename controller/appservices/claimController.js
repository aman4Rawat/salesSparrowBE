const express = require("express");
const mongoose = require("mongoose");
const Claim = mongoose.model("Claim");
const Employee = mongoose.model("Employee");
const router = express.Router();
const jwt = require("jsonwebtoken");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");

const imageStorage = multer.diskStorage({
  destination: "images/claim_document",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
}).single("claim_document");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/submit_claim', (req,res)=>{
    imageUpload(req, res, async (err) => {
        console.log("file",req.file);
        console.log("body",req.body);
        // if (!req.file) return res.status(201).json({ status: false, message: "File not found"});
        let attachment = ``;
        if (req.file){
          attachment = `${base_url}${req.file.path}`;
        } 
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.json({ status: false, message: "Token is required" });
        let x = token.split(".");
        if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
        var decodedToken = jwt.verify(token, "test");
        var employee_id = decodedToken.user_id;
        let emp_data = await Employee.findOne({_id:employee_id})
        let party_type_id = req.body.party_type_id?req.body.party_type_id:"";
        let party_id = req.body.party_id?req.body.party_id:"";
        let claim_amount = req.body.claim_amount?req.body.claim_amount:"";
        let description = req.body.description?req.body.description:"";
        if(party_id=="") return res.json({status:false,message:"Please provide party"})
        if(claim_amount=="") return res.json({status:false,message:"Please provide claim amount"})
        let date = get_current_date().split(" ")[0];
        let new_claim =await  Claim.create({
            emp_id:employee_id,
            company_id:emp_data.companyId,
            party_type_id:party_type_id,
            party_id:party_id,
            claim_date:date,
            claim_amount:claim_amount,
            claim_type:"Credit",
            description:description,
            document:attachment,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active",
        })
        return res.json({status:true,message:"Claim submitted successfully",result:new_claim})
    })
})

router.post('/edit_status_claim',async (req,res)=>{
  let id = req.body.id?req.body.id:"";
  if(id=="") return res.json({status:false,message:"Please give id"})
  let approval_status = req.body.approval_status?req.body.approval_status:"";
  if(approval_status=="") return res.json({status:false,message:"Please give approval_status"})
  let data = await Claim.findOneAndUpdate({_id:id},{$set:{approval_status}})
  return res.json({status:true,message:"Updated successfully"})
})

module.exports = router;