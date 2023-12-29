const express = require("express");
const mongoose = require("mongoose");
const Unit = mongoose.model("Unit");
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

router.post('/add_unit',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let unit = req.body.unit?req.body.unit:"";
    let status = req.body.status?req.body.status:"";
    if(unit=="") return res.json({status:false,message:"Please provide the unit name."})
    if(status=="") return res.json({status:false,message:"Please provide the status."})
    let unit_data = await Unit.findOne({$and:[{company_id},{unit}]});
    if(unit_data) return res.json({status:false,message:"Unit already exists."});
    let new_unit = new Unit({
        company_id:company_id,
        unit:unit,
        Created_date:get_current_date(),
        Updated_date:get_current_date(),
        status:status,
    })
    let result = await new_unit.save();
    return res.json({status:true,message:"Unit created successfully",result:result})
});

router.get('/get_all_units',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let unit_data = await Unit.find({company_id});
    return res.json({status:true,message:"Found successfully",result:unit_data});
});

router.post('/edit_unit',async (req,res)=>{
    let id = req.body.id?req.body.id:"";
    if(id=="") return res.json({status:false,message:"Please give id"})
    let updated_unit = {};
    if(req.body.unit){
        updated_unit.unit = req.body.unit;
    }
    if(req.body.status){
        updated_unit.status = req.body.status;
    }
    updated_unit.Updated_date = get_current_date();
    await Unit.findByIdAndUpdate({_id:id},updated_unit,{new:true});
    return res.json({status:true,message:"Updated successfully",result:updated_unit})
});

router.delete('/delete_unit',async (req,res)=>{
    let id = req.body.id?req.body.id:"";
    if(id=="") return res.json({status:false,message:"Please give id"})
    await Unit.deleteOne({_id:id});
    return res.json({status:true,message:"Deleted successfully"})
})

module.exports = router;