const express = require("express");
const mongoose = require("mongoose");
const EmployeeTarget = mongoose.model("EmployeeTarget");
const Location = mongoose.model("Location");
const Employee = mongoose.model("Employee");
const Mapping = mongoose.model("Mapping");
const Admin = mongoose.model("AdminInfo");
const {extractCompanyId} = require("../../middleware/response")
const Party = mongoose.model("Party");
const router = express.Router();
const jwt = require("jsonwebtoken")

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
  };

router.post('/addEmpTarget',extractCompanyId,async (req,res)=>{
    const company_id = req.company_id;
    console.log(req.body);
    var {state,employee,month,year,target,total_visit,total_secondary,total_primary} = req.body
    if(!state  || !month || !year || !employee || !total_visit || !total_secondary || !total_primary ) return res.json({status:false,message:"Please give proper details"})
    if(target.length<1) return res.json({status:false,message:"Please give target"})
    let state_data = await Location.findOne({id:state})
    let emp_data = await Employee.findOne({_id:employee})
    let city_data = await Location.findOne({id:emp_data.headquarterCity})
    let company_data = await Admin.findOne({_id:company_id})
    let data = await EmployeeTarget.find({employee_id:employee,month,year});
    if(data.length>0) return res.json({status:true,message:"Target already assigned for this month"})
    try{
        var new_target = await EmployeeTarget.create({
            state_id:state,
            company_id:company_id,
            employee_id:employee,
            month,
            year,
            target:target,
            status:"Active",
            state_name:state_data.name,
            created_by:company_data.company_name,
            company_name:company_data.company_name,
            employee_name:emp_data.employeeName,
            city_id:city_data.id ,
            city_name:city_data.name ,
            total_visit:total_visit,
            total_secondary:total_secondary,
            total_primary:total_primary,
        });
        return res.json({status:true,message:"Target assigned successfully",result:new_target})
    }catch(err){
        console.log(`error ------------ `,err);
        res.status(400).send(`error ------------ ${err}`)
    }
});

router.post("/getAllPartyEmp", async (req, res) => {
    let employee_id = req.body.employee_id?req.body.employee_id:""
    let page = req.body.page ? req.body.page : "1";
    let limit = 10;
    let count = await Party.find({ employee_id });
    let list = [];
    Mapping.find({primary_id:employee_id,primary_type:"Employee",assigned_to_type:"Party"}).sort({"status":-1}).limit(limit * 1).skip((page - 1) * limit).exec().then(async (party_data) => {
        if (party_data.length > 0) {
          let counInfo = 0;
          for (let i = 0; i < party_data.length; i++) {
            let party = await Party.findOne({_id:party_data[i].assigned_to_id,is_delete:"0"})
            if(party){
              let state_data = await Location.findOne({ id: party.state });
              let city_data = await Location.findOne({ id: party.city });
              let party_type_data = await PartyType.findOne({ _id: party.partyType });
              var u_data = {
                id: party._id,
                state: { name: state_data.name, id: party.state },
                city: { name: city_data.name, id: party.city },
                // district: {name: district_data.name,id: party.district,},
                firmName: party.firmName,
                party_unique_id:`${party.company_code}${party.party_code}`,
                address1: party.address1,
                address2: party.address2,
                partyType: party_type_data.party_type,
                image: party.image,
                pincode: party.pincode,
                GSTNo: party.GSTNo,
                contactPersonName: party.contactPersonName,
                mobileNo: party.mobileNo,
                email: party.email,
                DOB: party.DOB,
                DOA: party.DOA,
                route: party.route,
                status: party.status,
              };
              list.push(u_data);
            }
            counInfo++;
            if (counInfo == party_data.length) {
              console.log('list-----------',list)
              let c = Math.ceil(count.length / limit);
              if (c == 0) {
                c += 1;
              }
               return res.json({status: true,message: "All Parties found successfully",result: list,pageLength: c,});
            }
          }
        } else {
          return res.json({status: true,message: "No party found",result: [],});
        }
      });
  });

router.post('/get_all_employee_target',extractCompanyId,async(req,res)=>{
    const company_id = req.company_id;
    let page = req.body.page?req.body.page:"1";
    let limit = req.body.limit?req.body.limit:10;
    let target_data = await EmployeeTarget.find({company_id}).limit(limit*1).skip((page-1)*limit);
    let count = await EmployeeTarget.countDocuments({company_id})
    if(target_data.length>0){
        return res.json({status:true,message:"Data",result:target_data,pageLength:Math.ceil(count/limit),count:count})
    }else{
        return res.json({status:true,message:"No Data"});
    }
})

router.post('/edit_emp_target',async (req,res)=>{
    let target_id = req.body.target_id?req.body.target_id:"";
    if(req.body.target.length>0){
        try{
            let updated_data = await EmployeeTarget.findByIdAndUpdate({_id:target_id},{$set:{target:req.body.target,updated_date:new Date()}})
            return res.json({status:true,message:"Updated successfully",result:updated_data})
        }catch(err){
            console.log(`error ------------- ${err}`)
            return res.send(`error ------------- ${err}`)
        }
    }
})

router.delete('/delete_target',async(req,res)=>{
    let target_id = req.body.target_id?req.body.target_id:"";
    await EmployeeTarget.delete({_id:target_id})
    return res.json({status:true,message:"Deleted successfully"})
})



module.exports = router;
