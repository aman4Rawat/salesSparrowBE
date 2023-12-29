const express = require("express");
const mongoose = require("mongoose");
const CustomerType = mongoose.model("CustomerType");
const router = express.Router();

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/addCustomerType',(req,res)=>{
    let type = req.body.type?req.body.type:"";
    if(type=="") return res.json({status:false,message:"Please assign type"});
        let new_customer_type= new CustomerType({
            customer_type:type,
            level:"1",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active"
        })
        new_customer_type.save().then((data)=>{
            res.json({status:true,message:"Customer type created successfully",result:data})
        })
})

router.get('/getCustomerType',(req,res)=>{
    CustomerType.find().exec().then(customer_type_data=>{
        res.json({status:true,message:"Found successfully",result:customer_type_data})
    })
})

module.exports = router;