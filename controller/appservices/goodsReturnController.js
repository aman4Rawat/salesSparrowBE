const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const VoucherGoodsReturn = mongoose.model("VoucherGoodsReturn");
const DetailedGoodsReturn = mongoose.model("DetailedGoodsReturn");
const DetailedGoodsReturnItem = mongoose.model("DetailedGoodsReturnItem");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const jwt = require("jsonwebtoken");

const imageStorage = multer.diskStorage({
    destination: "images/voucher_img",
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now());
    },
  });
  
  const imageUpload = multer({
    storage: imageStorage,
  }).single("voucher_img");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/create_voucher',(req,res)=>{
    imageUpload(req, res, async (err) => {
        console.log("file",req.file);
        console.log("body",req.body);
        if (!req.file) return res.status(201).json({ status: false, message: "File not found"});
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.json({ status: false, message: "Token is required" });
        let x = token.split(".");
        if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
        var decodedToken = jwt.verify(token, "test");
        var employee_id = decodedToken.user_id;
        let emp_data = await Employee.findOne({_id:employee_id})
        let date = get_current_date().split(" ")[0];
        let party_type_id = req.body.party_type_id?req.body.party_type_id:"";
        let party_id = req.body.party_id?req.body.party_id:"";
        let total_qty = req.body.total_qty?req.body.total_qty:"";
        let total_amount = req.body.total_amount?req.body.total_amount:"";
        let net_amount = req.body.net_amount?req.body.net_amount:"";
        let depriciation = req.body.depriciation?req.body.depriciation:"";
        let description = req.body.description?req.body.description:"";
        if(party_id=="") return res.json({status:false,message:"Provide Party "})
        if(total_qty=="") return res.json({status:false,message:"Provide total quantity"})
        if(total_amount=="") return res.json({status:false,message:"Provide total amount"})
        let new_voucher = await VoucherGoodsReturn.create({
            emp_id:employee_id,
            company_id:emp_data.companyId,
            party_type_id:party_type_id,
            party_id:party_id,
            total_amount:total_amount,
            net_amount:net_amount,
            total_qty:total_qty,
            depriciation:depriciation,
            description:description,
            date:date,
            photo:`${base_url}${req.file.path}`,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active",
        })
        return res.json({status:true,message:"Voucher created",result:new_voucher})
    })
});

router.post('/detailed_goods_return',async (req,res)=>{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data =await Employee.findOne({_id:employee_id});
  if(!emp_data) return res.json({status:false,message:"Employee not found"})
  let party_type_id = req.body.party_type_id?req.body.party_type_id:"";
  let party_id = req.body.party_id?req.body.party_id:"";
  let total_amount = req.body.total_amount?req.body.total_amount:"";
  let deprication = req.body.deprication?req.body.deprication:"";
  let line = req.body.line?req.body.line:null;
  if(emp_data.status=="InActive" || emp_data.status=="UnApproved") return res.json({status:false,message:`You are ${emp_data.status} . Please contact company.`})
  if(party_type_id=="") return res.json({status:false,message:"Give party type"});
  if(party_id=="") return res.json({status:false,message:"Give party "});
  if(deprication=="") return res.json({status:false,message:"Give deprication "});
  if(total_amount=="") return res.json({status:false,message:"Give total_amount "});
  if(line==null) return res.json({status:false,message:"Please select atleast one product"});
  let date = get_current_date().split(" ")[0];
  // let total_amount = 0;
  // for(let i = 0;i<line.length;i++){
  //     total_amount += line[i].product_price * line[i].quantity;
  // }
  let net_amount = (parseInt(total_amount)*parseInt(deprication))/100;
  console.log("total_amount-----",total_amount)
  let new_order = await DetailedGoodsReturn.create({
      emp_id:employee_id,
      company_id:emp_data.companyId,
      party_type_id:party_type_id,
      goods_return_date:date,
      party_id:party_id,
      total_amount:total_amount,
      net_amount:net_amount,
      deprication:deprication,
      Created_date:get_current_date(),
      Updated_date:get_current_date(),
      status:"Active",
  });
  let list = [];
  for(let i = 0;i<line.length;i++){
      let new_detailed_order_line =await DetailedGoodsReturnItem.create({
          detailed_id:new_order._id,
          product_id:line[i].product_id,
          product_price:line[i].product_price,
          quantity:line[i].quantity,
          sub_total_price:line[i].product_price * line[i].quantity,
          Created_date:get_current_date(),
          Updated_date:get_current_date(),
          status:"Active",
      })
      list.push(new_detailed_order_line);
  }
  return res.json({status:true,message:"Detailed goods return submitted successfully",result:new_order,list})
});

router.post('/edit_status_detailed',async (req,res)=>{
  let id = req.body.id?req.body.id:"";
  if(id=="") return res.json({status:false,message:"Please give id"})
  let approval_status = req.body.approval_status?req.body.approval_status:"";
  if(approval_status=="") return res.json({status:false,message:"Please give approval_status"})
  let data = await DetailedGoodsReturn.findOneAndUpdate({_id:id},{$set:{approval_status}})
  return res.json({status:true,message:"Updated successfully"})
})

router.post('/edit_status_voucher',async (req,res)=>{
  let id = req.body.id?req.body.id:"";
  if(id=="") return res.json({status:false,message:"Please give id"})
  let approval_status = req.body.approval_status?req.body.approval_status:"";
  if(approval_status=="") return res.json({status:false,message:"Please give approval_status"})
  let data = await VoucherGoodsReturn.findOneAndUpdate({_id:id},{$set:{approval_status}})
  return res.json({status:true,message:"Updated successfully"})
})

module.exports = router;