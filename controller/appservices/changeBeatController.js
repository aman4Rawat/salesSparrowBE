const express = require("express");
const mongoose = require("mongoose");
const Beat = mongoose.model("Beat");
const beatChange = mongoose.model("beatChange");
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

router.post("/changeBeat", (req, res) => {
  var beat = req.body.beat ? req.body.beat : "";
  var reason = req.body.reason ? req.body.reason : "";
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  if(reason!=""){
    if(beat!=""){
        var change_beat = new beatChange({
            beat_id:beat,
            emp_id:employee_id,
            reason:reason,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active"
          });
          change_beat.save().then((data)=>{
            if(data){
                res.json({
                    status:true,
                    message:"Beat changed successfully",
                    result:data
                })
            }
          })
    }else{
        res.json({
            status:false,
            message:"Beat must be selected",
            result:data
        })
    }
  }else{
    res.json({
        status:true,
        message:"Reason must be provided",
        result:data
    })
  }
});

module.exports = router;