const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const {extractCompanyId} = require("../../middleware/response")
const Role = mongoose.model("role");
const Employee = mongoose.model("Employee");
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

router.post("/addRole", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if(!token){
    return res.json({
      status:false,
      message:"Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  var rolename = req.body.rolename ? req.body.rolename : "";
  var hierarchy_level = req.body.hierarchy_level
    ? req.body.hierarchy_level
    : "";
  var status = req.body.status ? req.body.status : "";
  if (rolename != "") {
    if (hierarchy_level != "") {
      var new_role = new Role({
        rolename: rolename,
        hierarchy_level: hierarchy_level,
        company_id:company_id,
        Created_date: get_current_date(),
        Updated_date: get_current_date(),
        status: status,
      });
      new_role.save().then((data) => {
        res.status(200).json({
          status: true,
          message: "Role created successfully",
          details: data,
        });
      });
    } else {
      res.json({
        status: false,
        message: "please provide the hierarchy_level",
      });
    }
  } else {
    res.json({
      status: false,
      message: "please provide the role",
    });
  }
});

router.get("/getAllRoles", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if(!token){
    return res.json({
      status:false,
      message:"Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  Role.find({company_id}).exec().then((role_data) => {
    if(role_data.length<1){
      return res.json({
        status:true,
        message:"No roles found",
        result:[]
      })
    }else{
      res.status(200).json({
        status: true,
        message: "Roles fetched succesfully",
        result: role_data,
      });
    }
    });
});

router.post("/reportingTo", (req, res) => {
  var role_id = req.body.role_id ? req.body.role_id : "";
  const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        res.json({
            status:false,
            message:"Please give token"
        })
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
  if (role_id != "") {
    Role.findOne({ _id: role_id }).exec().then(async (role_data) => {
        if (!role_data) {
          return res.json({
            status: true,
            message: "No Role found",
            result: [],
          });
        }
        var hierarchy_level = parseInt(role_data.hierarchy_level);
        var role_new_data = await Role.find({company_id});
        var role_id_array = [];
        role_new_data.forEach((r_data) => {
          if (r_data.hierarchy_level < hierarchy_level) {
            role_id_array.push(r_data._id);
          }
        });
        Employee.find({$and:[{roleId:{$in:role_id_array}},{companyId:company_id}]}).exec().then((emp_data) => {
            if (emp_data.length < 1) {
              res.json({
                status: true,
                message: "No Employee found",
                result: [],
              });
            } else {
              res.json({
                status: true,
                message: "Employees found",
                result: emp_data,
              });
            }
          });
      });
  } else {
    res.json({
      status: false,
      message: "Please give the role_id",
    });
  }
});

router.post("/view_reportees",extractCompanyId, (req, res) => {
  console.log("Hello")
  var role_id = req.body.role_id ? req.body.role_id : "";
  const company_id = req.company_id;
  if (role_id != "") {
    Role.findOne({ _id: role_id }).exec().then(async (role_data) => {
        if (!role_data) {
          return res.json({
            status: true,
            message: "No Role found",
            result: [],
          });
        }
        var hierarchy_level = parseInt(role_data.hierarchy_level);
        console.log('hierarchy_level------',hierarchy_level)
        var role_new_data = await Role.find({company_id});
        var role_id_array = [];
        role_new_data.forEach((r_data) => {
          if (r_data.hierarchy_level > hierarchy_level) {
            role_id_array.push(r_data._id);
          }
        });
        Employee.find({$and:[{roleId:{$in:role_id_array}},{companyId:company_id}]}).exec().then((emp_data) => {
            if (emp_data.length < 1) {
              res.json({
                status: true,
                message: "No Employee found",
                result: [],
              });
            } else {
              res.json({
                status: true,
                message: "Employees found",
                result: emp_data,
              });
            }
          });
      });
  } else {
    res.json({
      status: false,
      message: "Please give the role_id",
    });
  }
});

module.exports = router;
