const express = require("express");
const mongoose = require("mongoose");
const Activity = mongoose.model("Activity");
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

router.post('/addActivity',(req,res)=>{
    let activity = req.body.activity?req.body.activity:"";
    if(activity=="") return res.json({status:false,message:"Please assign activity"});
        let new_activity= new Activity({
            activity:activity,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active"
        })
        new_activity.save().then((data)=>{
            res.json({status:true,message:"Activity created successfully",result:data})
        })
})

router.get('/getActivity', async (req,res)=>{
    try {
       let activity_data = await Activity.find()
        res.json({status:true,message:"Found successfully",result:activity_data})
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;