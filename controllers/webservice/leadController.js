const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Lead = mongoose.model("Lead");

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addLead',(req,res)=>{
    var leadName = req.body.leadName?req.body.leadName:"";
    var displayName = req.body.displayName?req.body.displayName:"";
    var mobileNumber = req.body.mobileNumber?req.body.mobileNumber:"";
    var email = req.body.email?req.body.email:"";
    var pincode = req.body.pincode?req.body.pincode:"";
    var state = req.body.state?req.body.state:"";
    // var district = req.body.district?req.body.district:"";
    var city = req.body.city?req.body.city:"";
    var leadSource = req.body.leadSource?req.body.leadSource:"";
    var addBy = req.body.addBy?req.body.addBy:"";
    var note = req.body.note?req.body.note:"";
    var assignToEmp = req.body.assignToEmp?req.body.assignToEmp:"";
    if (leadName != "") {
        if (displayName != "") {
          if (mobileNumber != "") {
            if (email != "") {
              if (state != "") {
                if (city != "") {
                        if (leadSource != "") {
                          if (addBy != "") {
                            if (assignToEmp != "") {
                                var new_lead = new Lead({
                                    leadName:leadName,
                                    displayName:displayName,
                                    mobileNumber:mobileNumber,
                                    email:email,
                                    pincode:pincode,
                                    state:state,
                                    // district:district,
                                    city:city,
                                    leadSource:leadSource,
                                    addBy:addBy,
                                    note:note,
                                    assignToEmp:assignToEmp,
                                    Created_date:get_current_date(),
                                    Updated_date:get_current_date(),
                                    status:"Active"
                                });
                                new_lead.save().then(data=>{
                                    res.status(200).json({
                                        status:true,
                                        message:"Lead created successfully",
                                        details:data
                                    })
                                })
                            } else {
                                return res.json({
                                    status: false,
                                    message: "Assign to which employee is required",
                                    results: null,
                                  });
                            }
                          } else {
                            return res.json({
                                status: false,
                                message: "add by is required",
                                results: null,
                              });
                          }
                        } else {
                          return res.json({
                            status: false,
                            message: "lead source is required",
                            results: null,
                          });
                        }

                } else {
                    return res.json({
                        status: false,
                        message: "city is required",
                        results: null,
                      });
                }
              } else {
                return res.json({
                    status: false,
                    message: "state is required",
                    results: null,
                  });
              }
            } else {
              return res.json({
                status: false,
                message: "email is required",
                results: null,
              });
            }
          } else {
            return res.json({
              status: false,
              message: "Mobile Number is required",
              results: null,
            });
          }
        } else {
          return res.json({
            status: false,
            message: "display name is required",
            results: null,
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Lead Name is required",
          results: null,
        });
      }
});

router.get('/getLead',(req,res)=>{
    var state = req.body.state?req.body.state:"";
    var employee = req.body.employee?req.body.employee:"";
    var leadSource = req.body.leadSource?req.body.leadSource:"";
    if(state!=""){
        if(employee!=""){
            if(leadSource!=""){
                Lead.find({$and:[{state:state},{assignToEmp:employee},{leadSource:leadSource}]}).exec().then(lead_data=>{
                    if(lead_data.length>0){
                        res.status(200).json({
                            status:true,
                            message:"Lead found successfully",
                            result:lead_data
                        })
                    }else{
                        res.json({
                            status:false,
                            message:"Lead not found",
                            result:null
                        })
                    }
                })
            }else{
                return res.json({
                    status: false,
                    message: "Lead Source is required",
                    results: null,
                  });
            }
        }else{
            return res.json({
                status: false,
                message: "Employee is required",
                results: null,
              });
        }
    }else{
        return res.json({
            status: false,
            message: "State is required",
            results: null,
          });
    }
})

module.exports = router;

