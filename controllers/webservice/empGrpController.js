const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Group = mongoose.model("Group");
const Location = mongoose.model("Location");
const Employee = mongoose.model("Employee");
const EmployeeGrouping = mongoose.model("EmployeeGrouping");
const jwt = require("jsonwebtoken");

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};


router.post('/addEmpGrp',(req,res)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var empIdStr = req.body.empIdStr?req.body.empIdStr:"";
    var empIdArr = empIdStr.split(",");
    var grp_name = req.body.grp_name?req.body.grp_name:"";
    var state = req.body.state?req.body.state:"";
    var grp_description = req.body.grp_description?req.body.grp_description:"";
    if(grp_name!=""){
        if(grp_description!=""){
            Group.find({grp_name}).exec().then(data=>{
                if(data.length<1){
                    var new_grp = new Group({
                        grp_name:grp_name,
                        grp_description:grp_description,
                        company_id:company_id,
                        state:state,
                        Created_date:get_current_date(),
                        Updated_date:get_current_date(),
                        status:"Active"
                    });
                    new_grp.save().then(doc=>{
                        if(doc){
                            Group.findOne({grp_name}).exec().then((data)=>{
                                for(let i = 0; i < empIdArr.length; i++){
                                    Employee.findOne({_id:empIdArr[i]}).exec().then(async (emp_data)=>{
                                        var new_emp_grp = new EmployeeGrouping({
                                            grp_id:data._id,
                                            emp_id:empIdArr[i],
                                            employeeName:emp_data.employeeName,
                                            company_id:company_id,
                                            Created_date:get_current_date(),
                                            Updated_date:get_current_date(),
                                            status:"Active"
                                        });
                                        await new_emp_grp.save()
                                    });
                                }
                                Group.findOne({grp_name}).exec().then((data2)=>{
                                    EmployeeGrouping.find({grp_id:data2._id}).exec().then(egdata=>{
                                        res.json({
                                            status:true,
                                            message:"Employee group created succesfully",
                                            grpDetails:data,
                                            empGrpDetails:egdata
                                        });
                                    });
                                })
                            });
                        }else{
                            res.json({
                                status:false,
                                message:"Employee group not saved successfully."
                            })
                        }
                    });
                }else{
                    res.json({
                        status:false,
                        message:"Group Name already exists.Please think about another one."
                    })
                }
            })
        }else{
            res.json({
                status:false,
                message:"Group Name is required",
                result:null
            });
        }
    }else{
        res.json({
            status:false,
            message:"Atleast two Employees  is required",
            result:null
        });
    }
});

router.post('/empGrpList',async (req,res)=>{
    var state = req.body.state?req.body.state:"";
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var page = req.body.page?req.body.page:"1";
    let count =await Group.find({company_id});
    var limit = 10;
    if(state!=""){
        var list = [];
        Group.find({$and:[{state},{company_id}]}).limit( limit * 1).skip( (page - 1) * limit).exec().then(group_data=>{
            let counInfo = 0;
            if(group_data.length>0){
                for(let i = 0;i<group_data.length;i++){
                    Location.findOne({id:group_data[i].state}).exec().then(async (state_data)=>{
                        await (async function(rowData){
                            // console.log(rowData);
                            var u_data = {
                                id:rowData._id,
                                grp_name:rowData.grp_name,
                                grp_description:rowData.grp_description,
                                state:{name:state_data.name,id:state_data._id}
                            }
                            list.push(u_data);
                        })(group_data[i])
                        counInfo++;
                    if(counInfo==group_data.length){
                        res.json({
                            status:true,
                            message:"Employee groups of this state listed successfully.",
                            result:list,
                            pageLength:Math.ceil(count.length/limit)
                        })
                    }
                    });
                }
            }else{
                res.json({
                    status:true,
                    message:"No EmpGroup found in thid state for this org.",
                    result:[]
                })
            }
        })
    }else{
        var list = [];
        Group.find({company_id}).limit( limit * 1).skip( (page - 1) * limit).exec().then(group_data=>{
            let counInfo = 0;
            console.log(group_data);
            if(group_data.length>0){
                console.log("inside else if")
                for(let i = 0;i<group_data.length;i++){
                    Location.findOne({id:group_data[i].state}).exec().then(async (state_data)=>{
                        await (async function(rowData){
                            var u_data = {
                                id:rowData._id,
                                grp_name:rowData.grp_name,
                                grp_description:rowData.grp_description,
                                state:{name:state_data.name,id:state_data._id}
                            }
                            list.push(u_data);
                        })(group_data[i])
                        counInfo++;
                    if(counInfo==group_data.length){
                        res.json({
                            status:true,
                            message:"Employee groups  listed successfully.",
                            result:list,
                            pageLength:Math.ceil(count.length/limit)
                        })
                    }
                    });
                }
            }else{
                console.log("no data")
                res.json({
                    status:true,
                    message:"No EmpGroup found for this org.",
                    result:[]
                })
            }
        })
    }
});

router.post('/editGrp',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var updated_grp = {};
    if(req.body.grp_name){
        updated_grp.grp_name = req.body.grp_name;
    }
    if(req.body.grp_description){
        updated_grp.grp_description = req.body.grp_description;
    }
    updated_grp.Updated_date = get_current_date();
    console.log(updated_grp);
    Group.findOneAndUpdate({_id:id},updated_grp,{new:true},(err,doc)=>{
        if(doc){
            if(req.body.empIdStr){
                var empIdArr = req.body.empIdStr.split(",");
                console.log(empIdArr);
                EmployeeGrouping.deleteMany({grp_id:id}).exec().then(async (err,doc)=>{
                    for(let i = 0; i < empIdArr.length; i++){
                        console.log(empIdArr[i]);
                        Employee.findOne({_id:empIdArr[i]}).exec().then(async (emp_data)=>{
                            console.log(emp_data)
                            var new_emp_grp = new EmployeeGrouping({
                                grp_id:id,
                                emp_id:empIdArr[i],
                                employeeName:emp_data.employeeName,
                                company_id:company_id,
                                Created_date:get_current_date(),
                                Updated_date:get_current_date(),
                                status:"Active"
                            });
                            await new_emp_grp.save()
                        })
                    }
                        res.json({
                            status:true,
                            message:"Updated successfully",
                            result:updated_grp
                        })
                })
            }else if(req.body.empIdStr==""){
                EmployeeGrouping.deleteMany({grp_id:id}).exec().then(async (err,doc)=>{
                    res.json({
                        status:true,
                        message:"Updated successfully",
                        result:[]
                    })
                })
            }
        }else{
            res.json({
                status:false,
                message:"some error"
            });
        }
    })
});

router.post('/getGrpWiseEmpList',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    Group.find({_id:id}).exec().then(grp_data=>{
        Location.find({id:grp_data[0].state}).exec().then(state_data=>{
            EmployeeGrouping.find({grp_id:id,is_delete:"0"}).exec().then(empgrp_data=>{
                if(empgrp_data.length<1){
                    res.json({
                        status:true,
                        result:[]
                    })
                }else{
                    var u_data = {
                        id:grp_data[0]._id,
                        grp_name:grp_data[0].grp_name,
                        grp_description:grp_data[0].grp_description,
                        state:state_data[0].name,
                        emp_data:empgrp_data
                    }
                    res.json({
                        status:true,
                        message:"data found successfully",
                        result:u_data
                    })
                }
            })
        })
    })
})

router.delete('/deleteEmpGrp',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    EmployeeGrouping.deleteMany({grp_id:id}).exec().then(doc=>{
        if(doc){
            Group.deleteOne({_id:id}).exec().then(doc2=>{
                res.json({
                    status:true,
                    message:"group deleted successfully"
                });
            })
        }
    })
})

module.exports = router;