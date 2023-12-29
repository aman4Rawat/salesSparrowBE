const express = require("express");
const mongoose = require("mongoose");
const PartyType = mongoose.model("PartyType");
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

router.post('/addPartyType',(req,res)=>{
    let type = req.body.type?req.body.type:"";
    let level = req.body.level?req.body.level:"";
    if(type=="") return res.json({status:false,message:"Please assign type"});
    if(level=="") return res.json({status:false,message:"Please assign level"});
        let new_party_type= new PartyType({
            party_type:type,
            level:level,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active"
        })
        new_party_type.save().then((data)=>{
            res.json({status:true,message:"Party type created successfully",result:data})
        })
})

router.get('/getPartyType',(req,res)=>{
    PartyType.find().exec().then(party_type_data=>{
        res.json({status:true,message:"Found successfully",result:party_type_data})
    })
})

module.exports = router;