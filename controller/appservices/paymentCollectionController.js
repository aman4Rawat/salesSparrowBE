const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const PaymentCollection = mongoose.model("PaymentCollection");
const PrimaryOrder = mongoose.model("PrimaryOrder");
const Invoice = mongoose.model("Invoice");
const router = express.Router();
const jwt = require("jsonwebtoken");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/submit_payment_collection',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({_id:employee_id});
    let party_type_id = req.body.party_type_id?req.body.party_type_id:"";
    let party_id = req.body.party_id?req.body.party_id:"";
    let amount = req.body.amount?req.body.amount:"";
    let payment_mode = req.body.payment_mode?req.body.payment_mode:"";
    let bank_name = req.body.bank_name?req.body.bank_name:"";
    if(party_type_id=="") return res.json({status:false,message:"Give party type"});
    if(party_id=="") return res.json({status:false,message:"Give party "});
    if(amount=="") return res.json({status:false,message:"Give amount "});
    if(payment_mode=="") return res.json({status:false,message:"Give payment mode "});
    let date = get_current_date().split(" ")[0];
    let new_payment_data =await PaymentCollection.create({
        employee_id:employee_id,
        company_id:emp_data.companyId,
        party_type_id:party_type_id,
        party_id:party_id,
        amount:amount,
        payment_mode:payment_mode,
        bank_name:bank_name,
        date:date,
        approval_status:"Pending",
        Created_date:get_current_date(),
        Updated_date:get_current_date(),
        status:"Active",
    })
    // let order_id = req.body.order_id?req.body.order_id:"";
    // if(order_id=="") {
    //   await PaymentCollection.deleteOne({_id:new_payment_data._id})
    //   return res.json({status:false,message:"Give order_id"});
    // }
    // let invoice_data = await Invoice.findOne({order_id})
    // remaining_amount = parseInt(invoice_data.pay_amount) - parseInt(new_payment_data.amount);
    // console.log(remaining_amount);
    // if(remaining_amount == 0){
    //   let updated_invoice = await Invoice.findOneAndUpdate({order_id},{$set:{pay_amount:remaining_amount,pay_status:"Paid"}})
    // }else{
    //   let updated_invoice = await Invoice.findOneAndUpdate({order_id},{$set:{pay_amount:remaining_amount}})
    // }
    return res.json({status:true,message:"Payment submitted successfully for approval",result:new_payment_data})
});

router.post('/get_invoice_of_party',async (req,res)=>{
  let party_id = req.body.party_id?req.body.party_id:"";
  if(party_id=="") return res.json({status:false,message:"Please give id"}) 
  let invoice_data = await Invoice.find({pay_status:"Pending",party_id})
  if(invoice_data.length<1) return res.json({status:true,message:"No Data",result:[]})
  return res.json({status:true,message:"Data",result:invoice_data})
})

router.post('/edit_status_payment_collection',async (req,res)=>{
  let id = req.body.id?req.body.id:"";
  if(id=="") return res.json({status:false,message:"Please give id"})
  let approval_status = req.body.approval_status?req.body.approval_status:"";
  if(approval_status=="") return res.json({status:false,message:"Please give approval_status"})
  let data = await PaymentCollection.findOneAndUpdate({_id:id},{$set:{approval_status}})
  return res.json({status:true,message:"Updated successfully"})
})

module.exports = router;