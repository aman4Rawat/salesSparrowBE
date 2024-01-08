const express = require("express");
const mongoose = require("mongoose");
const opn = require("opn");
const Unit = mongoose.model("Unit");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const Admin = mongoose.model("AdminInfo");
const SharedMedia = mongoose.model("SharedMedia");
const Lead = mongoose.model("Lead");
const File = mongoose.model("File");
const CustomerType = mongoose.model("CustomerType");
const LeadBanner = mongoose.model("LeadBanner");
const Message = mongoose.model("Message");
const Route = mongoose.model("Route");
const LeadGroup = mongoose.model("LeadGroup");
// const Leadfollow = mongoose.model("leadfollow");
const LeadFollowUp = mongoose.model("FollowUp");
const LeadGroupItem = mongoose.model("LeadGroupItem");
const Role = mongoose.model("role");
const Party = mongoose.model("Party");
const getBaseUrl = require("../../superadmin/utils/getBaseUrl");
const Retailer = mongoose.model("Retailer");
const Beat = mongoose.model("Beat");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fs = require("fs");
const { MulterError } = require("multer");
const { log } = require("console");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const protectTo = require("../../utils/auth");
const errorHandler = require("../../utils/errorResponse");

const imageStorage = multer.diskStorage({
  destination: "images/lead",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 100000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

const getDecodedToken = async (authHeader) => {
  try {
    if (!authHeader) {
      console.log("token not provided or user not logged in");
    }
    const authHeaderStringSplit = authHeader.split(" ");
    if (
      !authHeaderStringSplit[0] ||
      authHeaderStringSplit[0].toLowerCase() !== "bearer" ||
      !authHeaderStringSplit[1]
    ) {
      console.log("token not provided or user not logged in");
    }
    const token = authHeaderStringSplit[1];
    const decodedToken = jwt.verify(token, "test");
    return decodedToken;
  } catch (error) {
    throw error;
  }
};

router.post("/add_lead", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var leadName = req.body.leadName ? req.body.leadName : "";
  var displayName = req.body.displayName ? req.body.displayName : "";
  var mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : "";
  var email = req.body.email ? req.body.email : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  // var pincode         = (req.body.pincode) ? req.body.pincode : "";
  var deal_value = req.body.deal_value ? req.body.deal_value : "";
  var lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
  var customer_grp = req.body.customer_grp ? req.body.customer_grp : "";
  // var currency         = (req.body.currency) ? req.body.currency : "";
  var lead_potential = req.body.lead_potential ? req.body.lead_potential : "";
  var leadSource = req.body.leadSource ? req.body.leadSource : "Manual";
  // var addBy           = (req.body.addBy) ? req.body.addBy : "";
  var note = req.body.note ? req.body.note : "";
  var assignToEmp = req.body.assignToEmp ? req.body.assignToEmp : "";
  if (leadName == "")
    return res.json({ status: false, message: "Please give lead name" });
  if (state == "")
    return res.json({ status: false, message: "Please give state" });
  if (city == "")
    return res.json({ status: false, message: "Please give city" });
  if (deal_value == "")
    return res.json({ status: false, message: "Please give deal_value" });
  if (lead_stage == "")
    return res.json({ status: false, message: "Please give lead_stage" });
  if (customer_grp == "")
    return res.json({ status: false, message: "Please give customer_grp" });
  if (lead_potential == "")
    return res.json({ status: false, message: "Please give lead_potential" });
  if (leadSource == "")
    return res.json({ status: false, message: "Please give leadSource" });
  // if(assignToEmp == "") return res.json({status:false,message:"Please give assignToEmp"})
  if (token != "") {
    const decoded = await getDecodedToken(token);
    var emp_id = decoded.user_id;
    let emp_data = await Employee.findOne({ _id: emp_id });
    let date = get_current_date().split(" ")[0];
    var lead_data = new Lead();
    lead_data.company_id = emp_data.companyId;
    lead_data.leadName = leadName;
    lead_data.displayName = displayName;
    lead_data.mobileNumber = mobileNumber;
    lead_data.deal_value = deal_value;
    lead_data.email = email;
    //   lead_data.pincode             = pincode;
    lead_data.state = state;
    lead_data.date = date;
    lead_data.customer_grp = customer_grp;
    //   lead_data.currency            =currency;
    lead_data.lead_potential = lead_potential;
    lead_data.city = city;
    lead_data.leadSource = leadSource;
    lead_data.lead_stage = lead_stage;
    // lead_data.addBy               = addBy;
    lead_data.note = note;
    lead_data.assignToEmp = emp_id;
    lead_data.Created_date = get_current_date();
    // lead_data.status              = "InActive";
    lead_data.save((err1, doc) => {
      if (doc) {
        res.status(200).json({
          status: true,
          message: "Add successfully",
          results: doc,
        });
      } else {
        res.status(200).json({
          status: true,
          message: "Add error !",
          results: null,
        });
      }
    });
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.post("/add_lead_group", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  let colour = req.body.colour ? req.body.colour : "";
  let grp_name = req.body.grp_name ? req.body.grp_name : "";
  // let lead_id_arr        = (req.body.lead_id_arr) ? req.body.lead_id_arr : [];
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let emp_id = decoded.user_id;
    let emp_data = await Employee.findOne({ _id: emp_id });
    let date = get_current_date().split(" ")[0];
    let grp_data = await LeadGroup.findOne({ grp_name });
    if (grp_data)
      return res.json({ status: false, message: "Group name already taken!" });
    let new_lead_grp = await LeadGroup.create({
      company_id: emp_data.companyId,
      colour: colour,
      grp_name: grp_name,
      date: date,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: "Active",
    });
    //   for(let i = 0;i<lead_id_arr.length;i++){
    //       let new_lead_grp_item_data =await LeadGroupItem.create({
    //         company_id:user_id,
    //         grp_id:new_lead_grp._id,
    //         lead_id:lead_id_arr[i],
    //         date:date,
    //         Created_date:get_current_date(),
    //         Updated_date:get_current_date(),
    //         status:"Active",
    //       })
    //   }
    return res.json({
      status: true,
      message: "Group created successfuly",
      result: new_lead_grp,
    });
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.post("/edit_lead_grp", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let emp_id = decoded.user_id;
    let emp_data = await Employee.findOne({ _id: emp_id });
    let date = get_current_date().split(" ")[0];
    let lead_grp_id = req.body.lead_grp_id ? req.body.lead_grp_id : "";
    let lead_id_arr = req.body.lead_id_arr ? req.body.lead_id_arr : [];
    await LeadGroupItem.deleteMany({ grp_id: lead_grp_id });
    for (let i = 0; i < lead_id_arr.length; i++) {
      let new_lead_grp_item_data = await LeadGroupItem.create({
        company_id: emp_data.companyId,
        grp_id: lead_grp_id,
        lead_id: lead_id_arr[i],
        date: date,
        Created_date: get_current_date(),
        Updated_date: get_current_date(),
        status: "Active",
      });
    }
    return res.json({ status: true, message: "Group edited successfuly" });
  } else {
    res.json({ status: false, message: "Token is required!" });
  }
});

router.post("/get_leads", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  let leadSource = req.body.leadSource ? req.body.leadSource : "";
  let type = req.body.type ? req.body.type : "";
  let page = req.body.page ? req.body.page : 1;
  let limit = req.body.limit ? req.body.limit : 20;
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let emp_id = decoded.user_id;
    let emp_data = await Employee.findOne({ _id: emp_id });
    if (type == "leadstage") {
      let open = 0;
      let contacted = 0;
      let qualified = 0;
      let won = 0;
      let loose = 0;
      let open_deal_value = 0;
      let contacted_deal_value = 0;
      let qualified_deal_value = 0;
      let won_deal_value = 0;
      let loose_deal_value = 0;
      var condition = {};
      condition.is_delete = "0";
      if (leadSource != "") {
        condition.leadSource = leadSource;
      }
      if (emp_id != "") {
        condition.company_id = emp_data.companyId;
      }
      let lead_data = await Lead.find(condition)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      for (let i = 0; i < lead_data.length; i++) {
        if (lead_data[i].lead_stage == "Open") {
          open++;
          open_deal_value += parseInt(lead_data[i].deal_value);
        } else if (lead_data[i].lead_stage == "Contacted") {
          contacted++;
          contacted_deal_value += parseInt(lead_data[i].deal_value);
        } else if (lead_data[i].lead_stage == "Qualified") {
          qualified++;
          qualified_deal_value += parseInt(lead_data[i].deal_value);
        } else if (lead_data[i].lead_stage == "Won") {
          won++;
          won_deal_value += parseInt(lead_data[i].deal_value);
        } else if (lead_data[i].lead_stage == "Loose") {
          loose++;
          loose_deal_value += parseInt(lead_data[i].deal_value);
        }
      }
      let data = [
        { name: "Open", leads: open, deal_value: open_deal_value },
        {
          name: "Contacted",
          leads: contacted,
          deal_value: contacted_deal_value,
        },
        {
          name: "Qualified",
          leads: qualified,
          deal_value: qualified_deal_value,
        },
        { name: "Won", leads: won, deal_value: won_deal_value },
        { name: "Loose", leads: loose, deal_value: loose_deal_value },
      ];
      return res.json({ status: true, message: "Data", result: data });
    } else if (type == "leadpotential") {
      let high = 0;
      let medium = 0;
      let low = 0;
      var condition = {};
      condition.is_delete = "0";
      if (leadSource != "") {
        condition.leadSource = leadSource;
      }
      if (emp_id != "") {
        condition.company_id = emp_data.companyId;
      }
      let lead_data = await Lead.find(condition)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      let total_lead_data = await Lead.find(condition);
      let count = total_lead_data.length;
      for (let i = 0; i < lead_data.length; i++) {
        if (lead_data[i].lead_potential == "Low") {
          low++;
        } else if (lead_data[i].lead_potential == "Medium") {
          medium++;
        } else if (lead_data[i].lead_potential == "High") {
          high++;
        }
      }
      let data = [
        { name: "Low", count: low },
        { name: "Medium", count: medium },
        { name: "High", count: high },
      ];
      return res.json({
        status: true,
        message: "Data",
        result: data,
        total_leads_count: count,
      });
    } else if (type == "customergrp") {
      var condition = {};
      condition.is_delete = "0";
      if (leadSource != "") {
        condition.leadSource = leadSource;
      }
      if (emp_id != "") {
        condition.company_id = emp_data.companyId;
      }
      let list = [];
      let lead_data = await Lead.find(condition)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      let lead_grp_data = await LeadGroup.find({
        company_id: emp_data.companyId,
        is_delete: "0",
      });
      if (lead_grp_data.length < 1)
        return res.json({
          status: false,
          message: "No Lead Groups",
          result: [],
        });
      for (let i = 0; i < lead_grp_data.length; i++) {
        let grps_lead_data = await LeadGroupItem.find({
          grp_id: lead_grp_data[i]._id,
        });
        let u_data = {
          lead_grp_name: lead_grp_data[i].grp_name,
          leads: grps_lead_data.length,
        };
        list.push(u_data);
      }
      // list.push({total_leads:lead_data.length})
      return res.json({
        status: true,
        message: "Data",
        result: list,
        total_leads: lead_data.length,
      });
    } else if (type == "leadsourcelist") {
      let facebook_leads = 0;
      let instagram_leads = 0;
      let indiamart_leads = 0;
      let website_leads = 0;
      let manual_leads = 0;
      let tradeindia_leads = 0;
      var condition = {};
      condition.is_delete = "0";
      if (leadSource != "") {
        condition.leadSource = leadSource;
      }
      if (emp_id != "") {
        condition.company_id = emp_data.companyId;
      }
      let lead_data = await Lead.find(condition)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      let total_lead_data = await Lead.find(condition);
      let count = total_lead_data.length;
      for (let i = 0; i < lead_data.length; i++) {
        if (lead_data[i].leadSource == "Instagram") {
          instagram_leads++;
        } else if (lead_data[i].leadSource == "Facebook") {
          facebook_leads++;
        } else if (lead_data[i].leadSource == "IndiaMart") {
          indiamart_leads++;
        } else if (lead_data[i].leadSource == "TradeIndia") {
          tradeindia_leads++;
        } else if (lead_data[i].leadSource == "Website") {
          website_leads++;
        } else if (lead_data[i].leadSource == "Manual") {
          manual_leads++;
        }
      }
      let data = [
        { name: "All Leads", count: total_lead_data.length, x: true },
        { name: "Facebook", count: facebook_leads, x: false },
        { name: "Instagram", count: instagram_leads, x: false },
        { name: "IndiaMart", count: indiamart_leads, x: false },
        { name: "Website", count: website_leads, x: false },
        { name: "Manual", count: manual_leads, x: false },
        { name: "TradeIndia", count: tradeindia_leads, x: false },
      ];
      return res.json({
        status: true,
        message: "Data",
        result: data,
        page_length: Math.ceil(count / limit),
      });
    } else {
      return res.json({ status: false, message: "No Data", result: [] });
    }
  } else {
    res.json({ status: false, message: "Token required!" });
  }
});

router.post("/get_clients", protectTo, async (req, res) => {
  let status = req.body.status ? req.body.status : "";
  let type = req.body.type ? req.body.type : "";
  let page = req.body.page ? req.body.page : 1;
  let limit = req.body.limit ? req.body.limit : 20;
  let emp_id = req.loggedInUser.user_id;
  let emp_data = await Employee.findById(emp_id);
  Admin.findById(emp_data.companyId)
    .exec()
    .then(async (user_info) => {
      if (!user_info) {
        res.status(401).json({
          status: false,
          message: "User not found !",
          results: null,
        });
      } else {
        if (type == "customers") {
          let employee_id = req.body.employee_id ? req.body.employee_id : "";
          let beat_id = req.body.beat_id ? req.body.beat_id : "";
          let condition = {};
          condition.company_id = emp_data.companyId;
          if (status != "") {
            condition.status = status;
          }
          if (employee_id != "") {
            condition.employee_id = employee_id;
            if (beat_id == "") {
              let list = [];
              let retailer_data = await Retailer.find(condition)
                .limit(limit * 1)
                .skip((page - 1) * limit);
              let total_retailer_data = await Retailer.find(condition);
              let count = total_retailer_data.length;
              for (let i = 0; i < retailer_data.length; i++) {
                let route_data = Route.findOne({
                  _id: retailer_data[i].route_id,
                });
                let city_data = Location.findOne({ id: route_data.city });
                let beat_data = await Beat.find({ company_id: user_id });
                let x = "";
                for (let j = 0; j < beat_data.length; j++) {
                  if (beat_data[j].route.length > 0) {
                    for (let k = 0; k < beat_data[j].route.length; k++) {
                      if (beat_data[j].route[k] == retailer_data[i].route_id) {
                        x = beat_data[j].beatName;
                        break;
                      }
                    }
                  }
                  if (x != "") {
                    break;
                  }
                }
                let u_data = {
                  _id: retailer_data[i]._id,
                  customer_name: retailer_data[i].customerName,
                  city: city_data.name,
                  beat_name: x,
                  mobile_number: retailer_data[i].mobileNo,
                  status: retailer_data[i].status,
                };
                list.push(u_data);
              }
              return res.json({
                status: true,
                message: "Data",
                result: list,
                page_length: Math.ceil(count / limit),
              });
            } else if (beat_id != "") {
              let list = [];
              let beat_data = await Beat.findOne({ _id: beat_id });
              let retailer_list = [];
              for (let i = 0; i < beat_data.route.length; i++) {
                let retailer_data = await Retailer.find({
                  route_id: beat_data.route[i],
                });
                retailer_list.push(retailer_data);
              }
              for (let i = 0; i < retailer_list.length; i++) {
                let route_data = Route.findOne({
                  _id: retailer_list[i].route_id,
                });
                let city_data = Location.findOne({ id: route_data.city });
                let beat_data = await Beat.find({ _id: beat_id });
                let u_data = {
                  customer_name: retailer_list[i].customerName,
                  city: city_data.name,
                  beat_name: beat_data.beatName,
                  mobile_number: retailer_list[i].mobileNo,
                  status: retailer_list[i].status,
                };
                list.push(u_data);
              }
              return res.json({
                status: true,
                message: "Data",
                result: list,
              });
            }
          } else if (employee_id == "") {
            if (beat_id == "") {
              let list = [];
              let retailer_data = await Retailer.find(condition)
                .limit(limit * 1)
                .skip((page - 1) * limit);
              let total_retailer_data = await Retailer.find(condition);
              let count = total_retailer_data.length;
              for (let i = 0; i < retailer_data.length; i++) {
                let route_data = Route.findOne({
                  _id: retailer_data[i].route_id,
                });
                let city_data = Location.findOne({ id: route_data.city });
                let beat_data = await Beat.find({
                  company_id: emp_data.companyId,
                });
                let x = "";
                for (let j = 0; j < beat_data.length; j++) {
                  if (beat_data[j].route.length > 0) {
                    for (let k = 0; k < beat_data[j].route.length; k++) {
                      if (beat_data[j].route[k] == retailer_data[i].route_id) {
                        x = beat_data[j].beatName;
                        break;
                      }
                    }
                  }
                  if (x != "") {
                    break;
                  }
                }
                let u_data = {
                  customer_name: retailer_data[i].customerName,
                  city: city_data.name,
                  beat_name: x,
                  mobile_number: retailer_data[i].mobileNo,
                  status: retailer_data[i].status,
                };
                list.push(u_data);
              }
              return res.json({
                status: true,
                message: "Data",
                result: list,
                count,
                page_length: Math.ceil(count / limit),
              });
            } else if (beat_id != "") {
              let list = [];
              let beat_data = await Beat.findOne({ _id: beat_id });
              let retailer_list = [];
              for (let i = 0; i < beat_data.route.length; i++) {
                let retailer_data = await Retailer.find({
                  route_id: beat_data.route[i],
                });
                retailer_list.push(retailer_data);
              }
              for (let i = 0; i < retailer_list.length; i++) {
                let route_data = Route.findOne({
                  _id: retailer_list[i].route_id,
                });
                let city_data = Location.findOne({ id: route_data.city });
                let beat_data = await Beat.find({ _id: beat_id });
                let u_data = {
                  customer_name: retailer_list[i].customerName,
                  city: city_data.name,
                  beat_name: beat_data.beatName,
                  mobile_number: retailer_list[i].mobileNo,
                  status: retailer_list[i].status,
                };
                list.push(u_data);
              }
              return res.json({
                status: true,
                message: "Data",
                result: list,
              });
            }
          }
          // let sub_type = req.body.sub_type?req.body.sub_type:"";
          // if(sub_type == "retailers"){
          //   let employee_id = req.body.employee_id?req.body.employee_id:"";
          //   let beat_id = req.body.beat_id?req.body.beat_id:"";
          //   let condition = {}
          //   condition.company_id = user_id;
          //   if(status !=""){
          //     condition.status = status;
          //   }
          //   if(employee_id!=""){
          //     condition.employee_id = employee_id;
          //     if(beat_id == ""){
          //       let list = []
          //       let retailer_data = await Retailer.find(condition).limit(limit*1).skip((page-1)*limit);
          //       let total_retailer_data = await Retailer.find(condition);
          //       let count = total_retailer_data.length;
          //       for(let i = 0;i<retailer_data.length;i++){
          //         let route_data = Route.findOne({_id:retailer_data[i].route_id});
          //         let city_data  = Location.findOne({id:route_data.city})
          //         let beat_data = await Beat.find({company_id:user_id});
          //         let x = "";
          //         for(let j = 0;j<beat_data.length;j++){
          //           if(beat_data[j].route.length>0){
          //             for(let k = 0;k<beat_data[j].route.length;k++){
          //               if(beat_data[j].route[k] == retailer_data[i].route_id){
          //                 x = beat_data[j].beatName;
          //                 break;
          //               }
          //             }
          //           }
          //           if(x != ""){
          //             break;
          //           }
          //         }
          //         let u_data = {
          //           customer_name:retailer_data[i].customerName,
          //           city:city_data.name,
          //           beat_name:x,
          //           mobile_number:retailer_data[i].mobileNo,
          //           status:retailer_data[i].status,
          //         }
          //         list.push(u_data);
          //       }
          //       return res.json({status:true,message:"Data",result:list,page_length:Math.ceil(count/limit)})
          //     }else if(beat_id !=""){
          //       let list = []
          //       let beat_data = await Beat.findOne({_id:beat_id});
          //       let retailer_list = []
          //       for(let i = 0;i<beat_data.route.length;i++){
          //         let retailer_data = await Retailer.find({route_id:beat_data.route[i]});
          //         retailer_list.push(retailer_data)
          //       }
          //       for(let i = 0;i<retailer_list.length;i++){
          //         let route_data = Route.findOne({_id:retailer_list[i].route_id});
          //         let city_data  = Location.findOne({id:route_data.city})
          //         let beat_data = await Beat.find({_id:beat_id});
          //         let u_data = {
          //           customer_name:retailer_list[i].customerName,
          //           city:city_data.name,
          //           beat_name:beat_data.beatName,
          //           mobile_number:retailer_list[i].mobileNo,
          //           status:retailer_list[i].status,
          //         }
          //         list.push(u_data)
          //       }
          //       return res.json({status:true,message:"Data",result:list})
          //     }
          //   }else if(employee_id ==""){
          //     if(beat_id == ""){
          //       let list = []
          //       let retailer_data = await Retailer.find(condition).limit(limit*1).skip((page-1)*limit);
          //       let total_retailer_data = await Retailer.find(condition);
          //       let count = total_retailer_data.length;
          //       for(let i = 0;i<retailer_data.length;i++){
          //         let route_data = Route.findOne({_id:retailer_data[i].route_id});
          //         let city_data  = Location.findOne({id:route_data.city})
          //         let beat_data = await Beat.find({company_id:user_id});
          //         let x = "";
          //         for(let j = 0;j<beat_data.length;j++){
          //           if(beat_data[j].route.length>0){
          //             for(let k = 0;k<beat_data[j].route.length;k++){
          //               if(beat_data[j].route[k] == retailer_data[i].route_id){
          //                 x = beat_data[j].beatName;
          //                 break;
          //               }
          //             }
          //           }
          //           if(x != ""){
          //             break;
          //           }
          //         }
          //         let u_data = {
          //           customer_name:retailer_data[i].customerName,
          //           city:city_data.name,
          //           beat_name:x,
          //           mobile_number:retailer_data[i].mobileNo,
          //           status:retailer_data[i].status,
          //         }
          //         list.push(u_data);
          //       }
          //       return res.json({status:true,message:"Data",result:list,page_length:Math.ceil(count/limit)})
          //     }else if(beat_id !=""){
          //       let list = []
          //       let beat_data = await Beat.findOne({_id:beat_id});
          //       let retailer_list = []
          //       for(let i = 0;i<beat_data.route.length;i++){
          //         let retailer_data = await Retailer.find({route_id:beat_data.route[i]});
          //         retailer_list.push(retailer_data)
          //       }
          //       for(let i = 0;i<retailer_list.length;i++){
          //         let route_data = Route.findOne({_id:retailer_list[i].route_id});
          //         let city_data  = Location.findOne({id:route_data.city})
          //         let beat_data = await Beat.find({_id:beat_id});
          //         let u_data = {
          //           customer_name:retailer_list[i].customerName,
          //           city:city_data.name,
          //           beat_name:beat_data.beatName,
          //           mobile_number:retailer_list[i].mobileNo,
          //           status:retailer_list[i].status,
          //         }
          //         list.push(u_data)
          //       }
          //       return res.json({status:true,message:"Data",result:list})
          //     }
          //   }
          // }else if(sub_type == "parties"){
          //   let condition = {};
          //   let party_type = req.body.party_type?req.body.party_type:"";
          //   if(party_type !=""){
          //     condition.partyType = party_type;
          //   }
          //   let party_data = await Party.find({company_id:user_id}).limit(limit*1).skip((page-1)*limit);
          //   let total_party_data = await Party.find({company_id:user_id});
          //   let count = total_party_data.length;
          //   let list = []
          //   for(let i = 0;i<party_data.length;i++){
          //     let city_data = await Location.findOne({id:party_data[i].city})
          //     let u_data = {
          //       party_name:party_data[i].firmName,
          //       city:city_data.name,
          //       mobile_number:party_data[i].mobileNo,
          //       status:party_data[i].status,
          //     }
          //     list.push(u_data)
          //   }
          //   return res.json({status:true,message:"Data",result:list,page_length:Math.ceil(count/limit)})
          // }else{
          //   return res.json({status:false,message:"Please provide sub type"})
          // }
        } else if (type == "leads") {
          let lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
          let lead_potential = req.body.lead_potential
            ? req.body.lead_potential
            : "";
          let leadSource = req.body.leadSource ? req.body.leadSource : "";
          let customer_grp = req.body.customer_grp ? req.body.customer_grp : "";
          let search = req.body.search ? req.body.search : "";
          let status = req.body.status ? req.body.status : "";
          let state = req.body.state ? req.body.state : "";
          let employee_id = req.body.employee_id ? req.body.employee_id : "";
          var list1 = [];
          var condition = {};
          condition.is_delete = "0";
          if (search != "") {
            var regex = new RegExp(search, "i");
            condition.leadName = regex;
          }
          if (state != "") {
            condition.state = state;
          }
          if (status != "") {
            condition.status = status;
          }
          if (lead_potential != "") {
            condition.lead_potential = lead_potential;
          }
          if (customer_grp != "") {
            condition.customer_grp = customer_grp;
          }
          if (employee_id != "") {
            condition.assignToEmp = employee_id;
          }
          if (leadSource != "") {
            condition.leadSource = leadSource;
          }
          if (lead_stage != "") {
            condition.lead_stage = lead_stage;
          }
          let lead_data = await Lead.find(condition)
            .limit(limit * 1)
            .skip((page - 1) * limit);
          let total_lead_data = await Lead.find(condition);
          let count = total_lead_data.length;
          if (lead_data.length < 1)
            return res.status(200).json({
              status: true,
              message: "Not Available !",
              results: list1,
            });
          let list = [];
          for (let i = 0; i < lead_data.length; i++) {
            let state_data = await Location.findOne({
              id: lead_data[i].state,
            });
            let city_data = await Location.findOne({ id: lead_data[i].city });
            let emp_data = await Employee.findById(lead_data[i].assignToEmp);
            let lead_grp_data = await LeadGroup.findById(lead_data[i].lead_grp);
            var leadfollow_data = await LeadFollowUp.findOne({
              lead_id: lead_data[i]._id,
            });
            var u_data = {
              _id: lead_data[i]._id,
              company_id: lead_data[i].company_id,
              leadName: lead_data[i].leadName,
              mobileNumber: lead_data[i].mobileNumber,
              state: state_data
                ? { id: lead_data[i].state, name: state_data.name }
                : { id: "NA", name: "NA" },
              city: city_data
                ? { id: lead_data[i].city, name: city_data.name }
                : { id: "NA", name: "NA" },
              leadSource: lead_data[i].leadSource,
              assignToEmp: emp_data.employeeName,
              lead_potential: lead_data[i].lead_potential,
              lead_stage: lead_data[i].lead_stage,
              lead_grp: lead_grp_data ? lead_grp_data.grp_name : "NA",
              last_follow_date: leadfollow_data
                ? leadfollow_data.Created_date
                : "NA",
            };
            list.push(u_data);
          }
          return res.json({
            status: true,
            message: "Data",
            count,
            page_length: Math.ceil(count / limit),
            result: list,
          });
        } else if (type == "groups") {
          let list = [];
          let date = get_current_date().split(" ")[0];
          let new_lead_data = await Lead.find({
            company_id: emp_data.companyId,
            is_delete: "0",
            date: date,
          });
          let new_leads = new_lead_data.length;
          let grp_data = await LeadGroup.find({
            company_id: emp_data.companyId,
            is_delete: "0",
          });
          for (let i = 0; i < grp_data.length; i++) {
            let leads_count = await LeadGroupItem.find({
              grp_id: grp_data[i]._id,
            });
            console.log(leads_count);
            let arr = [];
            for (let i = 0; i < leads_count.length; i++) {
              let lead_data = await Lead.findOne({
                _id: leads_count[i].lead_id,
                is_delete: "0",
              });
              // console.log(lead_data)
              if (lead_data) {
                let state_data = await Location.findOne({
                  id: lead_data.state,
                });
                let city_data = await Location.findOne({
                  id: lead_data.city,
                });
                let emp_data = await Employee.findOne({
                  _id: lead_data.assignToEmp,
                });
                let data = {
                  lead_name: lead_data.leadName ? lead_data.leadName : "",
                  _id: lead_data._id ? lead_data._id : "",
                  mobile_no: lead_data.mobileNumber
                    ? lead_data.mobileNumber
                    : "",
                  state: state_data ? state_data.name : "",
                  city: city_data ? city_data.name : "",
                  lead_source: lead_data.leadSource ? lead_data.leadSource : "",
                  assigned_to: emp_data ? emp_data.employeeName : "",
                  lead_potential: lead_data.lead_potential
                    ? lead_data.lead_potential
                    : "",
                  lead_statge: lead_data.lead_stage ? lead_data.lead_stage : "",
                  lead_grp: grp_data.grp_name,
                  last_follow_up: "",
                };
                arr.push(data);
              }
            }
            let u_data = {
              lead_grp_name: grp_data[i].grp_name,
              _id: grp_data[i]._id,
              lead_grp_color: grp_data[i].colour,
              leads_count: leads_count.length,
              leads_data: arr,
            };
            list.push(u_data);
          }
          // list.push({new_leads:new_leads})
          return res.json({
            status: true,
            message: "Data",
            result: list,
            new_leads: new_leads,
            new_lead_data: new_lead_data,
          });
        } else if (type == "teams") {
          let list = [];
          let team_data = await Employee.find({
            companyId: emp_data.companyId,
            is_delete: "0",
          })
            .limit(limit * 1)
            .skip((page - 1) * limit);
          let total_team_data = await Employee.find({
            companyId: emp_data.companyId,
            is_delete: "0",
          });
          let count = total_team_data.length;
          for (let i = 0; i < team_data.length; i++) {
            let state_data = await Location.findOne({
              id: team_data[i].headquarterState,
            });
            let role_data = await Role.findOne({ _id: team_data[i].roleId });
            let u_data = {
              _id: team_data[i]._id,
              emp_name: team_data[i].employeeName,
              image: team_data[i].image,
              designation: role_data ? role_data.rolename : "NA",
              state: state_data.name,
            };
            list.push(u_data);
          }
          return res.json({
            status: true,
            message: "Data",
            count,
            page_length: Math.ceil(count / limit),
            result: list,
          });
        }
      }
    });
});

router.post(
  "/add_lead_banner",
  imageUpload.fields([{ name: "file" }]),
  async (req, res) => {
    var token = req.get("Authorization") ? req.get("Authorization") : "";
    var type = req.body.type ? req.body.type : "";
    var name = req.body.name ? req.body.name : "";
    var date = req.body.date ? req.body.date : "";
    if (token != "") {
      const decoded = await getDecodedToken(token);
      var user_id = decoded.user_id;
      Admin.find({ _id: user_id })
        .exec()
        .then(async (user_info) => {
          if (user_info.length < 1) {
            res.status(401).json({
              status: false,
              message: "User not found !",
              results: null,
            });
          } else {
            var user_data = new LeadBanner();
            user_data.company_id = user_id;
            user_data.type = type;
            user_data.name = name;
            user_data.date = date;
            if (req.files.file) {
              console.log(req.files.file[0]);
              user_data.file = getBaseUrl() + req.files.file[0].path;
            }
            user_data.Created_date = get_current_date();
            user_data.status = "Active";
            user_data.save((err1, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Add successfully",
                  results: doc,
                });
              } else {
                res.status(200).json({
                  status: true,
                  message: "Add error !",
                  results: null,
                });
              }
            });
          }
        });
    } else {
      return res.json({
        status: false,
        message: "token require !",
        results: null,
      });
    }
  }
);

router.post("/leadBanner_list", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var type = req.body.type ? req.body.type : "";
  var search = req.body.search ? req.body.search : "";
  var page = req.body.page ? req.body.page : 1;
  var limit = req.body.limit ? req.body.limit : 20;
  if (token != "") {
    const decoded = await getDecodedToken(token);
    var user_id = decoded.user_id;
    Admin.find({ _id: user_id })
      .exec()
      .then(async (user_info) => {
        if (user_info.length < 1) {
          res.status(401).json({
            status: false,
            message: "User not found !",
            results: null,
          });
        } else {
          var list1 = [];
          var condition = {};
          condition.is_delete = "0";
          if (search != "") {
            var regex = new RegExp(search, "i");
            condition.name = regex;
          }
          if (type != "") {
            condition.type = type;
          }
          LeadBanner.find(condition)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ _id: -1 })
            .exec()
            .then(async (lead_banner_data) => {
              if (lead_banner_data.length > 0) {
                let counInfo = 0;
                for (let i = 0; i < lead_banner_data.length; i++) {
                  await (async function (rowData) {
                    var u_data = {
                      _id: rowData._id,
                      name: rowData.name,
                      file: rowData.file,
                      type: rowData.type,
                      status: rowData.status,
                    };
                    list1.push(u_data);
                  })(lead_banner_data[i]);
                  counInfo++;
                  if (counInfo == lead_banner_data.length) {
                    res.status(200).json({
                      status: true,
                      message: "List successfully",
                      results: list1,
                    });
                  }
                }
              } else {
                res.status(200).json({
                  status: true,
                  message: "Not Available !",
                  results: list1,
                });
              }
            });
        }
      });
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.post("/message", protectTo, async (req, res) => {
  try {
    let { title = "", body = "" } = req.body;
    title = title.trim();
    body = body.trim();
    const employeeId = req.loggedInUser.user_id;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data)
      return res.json({ status: false, message: "No employee data" });
    const date = get_current_date().split(" ")[0];

    if (!body || !title) {
      return res.json({
        status: false,
        message: "Please provide proper data",
      });
    }

    const newMessage = await Message.create({
      title,
      description: body,
      company_id: emp_data.companyId,
      status: "Active",
      feedBy: employeeId,
      date,
    });

    return res.json({
      status: true,
      message: "Message added successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to add message",
    });
  }
});

router.put("/message", protectTo, async (req, res) => {
  try {
    let { title = "", body = "" } = req.body;
    title = title.trim();
    body = body.trim();
    const id = req.body.id || "";
    if (id == "")
      return res.json({ status: false, message: "Please give message id" });
    /*The Object.assign() method creates a new object that has properties from the specified objects. In this case, we're creating a new object with the {} empty object as the first argument, followed by one or more objects that contain the updated properties.
The && operator is used to conditionally add properties to the updatedMessage object. If title is truthy (i.e., not null, undefined, 0, false, or ''), then the { title } object is added to updatedMessage. If body is truthy, then the { description: body } object is added to updatedMessage.
If both title and body are falsy, then the resulting updatedMessage object will be empty.*/

    const updatedMessage = Object.assign(
      {},
      title && { title },
      body && { description: body }
    );

    await Message.findByIdAndUpdate({ _id: id }, updatedMessage, {
      new: true,
    });

    return res.json({ status: true, message: "Updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Failed to update message",
    });
  }
});

router.delete("/message", protectTo, async (req, res) => {
  const employeeId = req.loggedInUser.user_id;
  let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
  if (!emp_data) return res.json({ status: false, message: "Please login!" });
  const message_id = req.body.id || "";
  if (!message_id)
    return res.json({ status: false, message: "Please give message id" });
  let msg_data = await Message.findOne({
    _id: message_id,
    is_delete: "0",
    feedBy: employeeId,
  });
  if (!msg_data) return res.json({ status: false, message: "No data found" });
  const isDeleted = await Message.findOneAndUpdate(
    { _id: message_id },
    { is_delete: "1", status: "InActive" }
  );
  console.log("isDeleted", isDeleted);
  if (!isDeleted) return res.json({ status: false, message: "No data found" });
  return res.json({ status: true, message: "Deleted successfully" });
});

router.get("/messages", protectTo, async (req, res) => {
  const employeeId = req.loggedInUser.user_id;
  let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
  if (!emp_data)
    return res.json({ status: false, message: "No employee data" });
  const { page = 1 } = req.body;
  const limit = 10;
  const skip = (page - 1) * limit;
  console.log("emp_data", emp_data);
  const [message_data, total_message_count] = await Promise.all([
    Message.find({
      company_id: emp_data.companyId,
      feedBy: employeeId,
      is_delete: "0",
    })
      .limit(limit)
      .skip(skip),
    Message.countDocuments({
      company_id: emp_data.companyId,
      feedBy: employeeId,
      is_delete: "0",
    }),
  ]);
  if (!message_data.length) {
    return res.json({
      status: true,
      message: "No data",
      result: [],
      count: 0,
      page_length: 0,
    });
  }
  return res.json({
    status: true,
    message: "Data",
    result: message_data,
    count: total_message_count,
    page_length: Math.ceil(total_message_count / limit),
  });
});

router.get("/message/:id", protectTo, async (req, res) => {
  const id = req.params.id || "";
  if (!id) {
    res.json({ status: false, message: "Please provide valid Id" });
  }
  const employee_id = req.loggedInUser.user_id;
  let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
  if (!emp_data)
    return res.json({ status: false, message: "No employee data" });
  console.log("emp_data", emp_data);
  const message_data = await Message.findOne({
    _id: id,
    company_id: emp_data.companyId,
    feedBy: employee_id,
    is_delete: "0",
  });
  console.log("message_data", message_data);
  if (!message_data) {
    return res.json({
      status: false,
      message: "No data found!",
    });
  }
  return res.json({
    status: true,
    message: "Data",
    result: message_data,
  });
});

router.post("/share-message_whatsapp", async (req, res) => {
  const { phone, message } = req.body;
  // const phoneNumbers = phone.map(p => `${p.replace(/\D/g,'')}`); // format phone numbers with country code
  // const url = `https://wa.me/${phoneNumbers.join(",")}?text=${encodeURIComponent(message)}`;
  const phoneNumbers = phone.join(",");
  console.log("phoneNumbers-----   ", typeof phoneNumbers);
  const url = `whatsapp://send?phone=${phoneNumbers}&text=${encodeURIComponent(
    message
  )}`;
  opn(url, (err) => {
    if (err) {
      console.error(err);
      return res.json({
        status: false,
        message: "Error opening share URL",
      });
    }
    return res.json({
      status: true,
      message: "URL opened successfully",
    });
  });
  return res.json({
    status: true,
    message: "URL opened successfully",
  });
});

// FILE SUB-MODULE
const upload = multer({
  storage: multer.memoryStorage({}),
  fileFilter: (req, file, cb) => {
    if (req.body.fileType.toUpperCase() == "PDF") {
      if (!file.originalname.match(/\.(pdf)$/)) {
        return cb("File format is unsupported, please upload pdf file!");
      }
      cb(null, true);
    } else if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
      return cb("File format is unsupported!");
    }
    cb(null, true);
  },
  limits: {
    fileSize: 52428800, //((50 * 1024) KB * 1024) MB
  },
}).fields([
  { name: "pdf", maxCount: 1 },
  { name: "file", maxCount: 6 },
]);

const multerErrorWrapper = (upload) => (req, res, next) => {
  try {
    upload(req, res, (err) => {
      log("error in multer", err);
      if (err instanceof MulterError) {
        if (err.code == "LIMIT_FILE_SIZE") {
          req.errors = "Please add file of size less than 20 MB ";
        }
        if (err.code == "LIMIT_UNEXPECTED_FILE") {
          req.errors = "Plese add limited files or PDF.";
        }
      } else if (err) {
        req.errors = err;
      }
      if (req.errors) {
        return res.json({ status: false, message: req.errors });
      }
      next();
    });
  } catch (err) {
    return res.json({ status: false, error });
  }
};

router.post(
  "/file",
  protectTo,
  multerErrorWrapper(upload),
  async (req, res) => {
    // contentFileHandler(req, res, "CREATE");
    try {
      const employeeId = req.loggedInUser.user_id;
      let emp_data = await Employee.findOne({
        _id: employeeId,
        is_delete: "0",
      });
      if (!emp_data)
        return res.json({ status: false, message: "No employee data" });
      let imageUrlData = [];
      let pdfUrlData = [];

      let {
        title = "",
        description = "",
        fileType = "",
        mediaUrl = "",
        websiteUrl = "",
        websiteName = "",
      } = req.body;

      if (!title && !fileType) {
        return res.json({
          status: false,
          message: "Please provide title and filetype",
        });
      }

      if (mediaUrl) {
        const pattern =
          /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (!mediaUrl.match(pattern)) {
          return res.json({
            status: false,
            message: "Please provide valid youtube url",
          });
        }
      }

      if (websiteUrl) {
        const pattern =
          /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
        if (!websiteUrl.match(pattern)) {
          return res.json({
            status: false,
            message: "Please provide valid website url",
          });
        }
      }

      fileType = fileType.toUpperCase();
      log("fileType", fileType);
      const date = get_current_date().split(" ")[0];
      if (fileType == "CATALOGUE") {
        if (req.files.file) {
          imageUrlData = Promise.all(
            req.files.file.map((file) =>
              writeImagePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
        if (req.files.pdf) {
          pdfUrlData = Promise.all(
            req.files.pdf.map((file) =>
              writePdfPromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      } else if (fileType == "PDF") {
        if (!req.files.pdf) {
          return res.json({
            status: true,
            message: "Please provide pdf",
          });
        }
        pdfUrlData = Promise.all(
          req.files.pdf.map((file) =>
            writePdfPromise(file)
              .then((path) => path)
              .catch((err) => err)
          )
        );
      } else {
        return res.json({
          status: false,
          message: "Please provide valid fileType",
        });
      }
      imageUrlData = (await imageUrlData) || null;
      pdfUrlData = (await pdfUrlData) || null;
      const file_data = await File.create({
        title: title.trim(),
        description: fileType == "PDF" ? null : description,
        images: imageUrlData,
        company_id: emp_data.companyId,
        date,
        mediaUrl: mediaUrl || null,
        websiteUrl: websiteUrl || null,
        websiteName,
        pdf: pdfUrlData,
        feedById: employeeId,
        feedBy: "EMPLOYEE",
        fileType: fileType,
        status: "Active",
      });
      console.log("imageUrlData", imageUrlData, pdfUrlData);
      console.log("file", req.files);
      // return res.json({ status: true, message: "File added successfully", result: new_file })
      return res.json({
        status: true,
        message: "File added successfully",
        data: file_data,
      });
    } catch (error) {
      return res.json({ status: false, error });
    }
    //     const fileStoragePath = 'images/File';
    //     let imageUrlData = [];
    //     let pdfUrlData = [];

    //     // for (file of req.files) {
    //     //   let ext = file.filename.substr(file.filename.lastIndexOf('.') + 1).toUpperCase();
    //     //   if (ext == 'PDF') pdfUrlData.push(getBaseUrl() + fileStoragePath + file.filename);
    //     //   else imageUrlData.push(getBaseUrl() + fileStoragePath + file.filename);
    //     //   // fileType = ext.toUpperCase() == 'PDF' ? 'PDF' : 'CATALOGUE';
    //     // }

    //     if (action == "CREATE") {
    //       const date = get_current_date().split(" ")[0];
    //       if (req.body?.fileType.toUpperCase() == "CATALOGUE") {
    //         // const path = "./images/File/";

    //         if (req.files.file) {
    //           imageUrlData = Promise.all(
    //             req.files.file.map((file) =>
    //               writeFilePromise(file)
    //                 .then((path) => path)
    //                 .catch((err) => err)
    //             )
    //           );
    //         }
    //         if (req.files.pdf) {
    //           pdfUrlData = Promise.all(
    //             req.files.pdf.map((file) =>
    //               writeFilePromise(file)
    //                 .then((path) => path)
    //                 .catch((err) => err)
    //             )
    //           );
    //         }
    //       } else if (req.body?.fileType.toUpperCase() == "PDF") {
    //         if (!req.files.pdf) {
    //           return res.json({
    //             status: true,
    //             message: "Please provide pdf"
    //           });
    //         }
    //         pdfUrlData = Promise.all(
    //           req.files.pdf.map((file) =>
    //             writeFilePromise(file)
    //               .then((path) => path)
    //               .catch((err) => err)
    //           )
    //         );
    //       }
    //       imageUrlData = (await imageUrlData) || null;
    //       pdfUrlData = (await pdfUrlData) || null;
    //       const file_data = await File.create({
    //         title: title.trim(),
    //         description: description.trim(),
    //         images: imageUrlData ,
    //         company_id: emp_data.companyId,
    //         date,
    //         pdf: pdfUrlData ,
    //         feedById: employeeId,
    //         feedBy: "EMPLOYEE",
    //         fileType: fileType.toUpperCase(),
    //         status: "Active"
    //       });
    //       console.log('imageUrlData', imageUrlData, pdfUrlData)
    //       console.log("file", req.files)
    //       // return res.json({ status: true, message: "File added successfully", result: new_file })
    //       return res.json({ status: true, message: "File added successfully", data: file_data })
    //     }
  }
);

router.put("/file", protectTo, multerErrorWrapper(upload), async (req, res) => {
  try {
    const employeeId = req.loggedInUser.user_id;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data)
      return res.json({ status: false, message: "No employee data" });
    let imageUrlData = [];
    let pdfUrlData = [];
    let {
      fileId = "",
      title,
      fileType = "",
      status,
      body,
      description,
      mediaUrl,
      imageUrl = [],
      websiteUrl,
      websiteName,
    } = req.body;
    if (!fileId || !title) {
      return res.json({
        status: false,
        message: "Please provide the id and title",
      });
    }
    if (!fileType) {
      return res.json({
        status: false,
        message: "Please provide the file type",
      });
    }
    fileType = fileType.toUpperCase();
    let update_date = get_current_date();
    let updated_file = {
      feedById: employeeId,
      company_id: emp_data.companyId,
      update_date,
    };

    if (fileType == "CATALOGUE") {
      if (req.files.file?.length) {
        imageUrlData = Promise.all(
          req.files.file.map((file) =>
            writeImagePromise(file)
              .then((path) => path)
              .catch((err) => err)
          )
        );
      }
      if (req.files.pdf?.length) {
        pdfUrlData = Promise.all(
          req.files.pdf.map((file) =>
            writePdfPromise(file)
              .then((path) => path)
              .catch((err) => err)
          )
        );
      }
    } else if (fileType == "PDF") {
      if (req.files.pdf?.length) {
        pdfUrlData = Promise.all(
          req.files.pdf.map((file) =>
            writePdfPromise(file)
              .then((path) => path)
              .catch((err) => err)
          )
        );
      }
    }

    if (imageUrl.length > 0) {
      const strValid = new RegExp(
        "^https://webservice.salesparrow.in/images/File/"
      );
      for (url of imageurl) {
        if (!url.match(strValid)) {
          return errorHandler(res, 400, "Invalid image url!");
        }
      }
    }

    imageUrlData = (await imageUrlData) || null;
    pdfUrlData = (await pdfUrlData) || null;

    if (imageUrlData.length) {
      updated_file.images = [...imageUrlData, ...imageUrl] || null;
    }

    imageUrlData = (await imageUrlData) || null;
    pdfUrlData = (await pdfUrlData) || null;

    if (pdfUrlData.length) {
      updated_file.pdf = pdfUrlData || null;
    }
    if (description) {
      updated_file.description = description || null;
    }
    if (title) {
      updated_file.title = title;
    }
    if (mediaUrl) {
      updated_file.mediaUrl = mediaUrl;
    }
    if (websiteUrl) {
      updated_file.websiteUrl = websiteUrl;
    }
    if (websiteName) {
      updated_file.websiteName = websiteName;
    }
    if (status) {
      updated_file.status = status;
    }
    if (body) {
      updated_file.body = body;
    }
    const updated_data = await File.findOneAndUpdate(
      { _id: fileId },
      updated_file,
      { new: true }
    );
    if (!updated_data) {
      return res.json({ status: false, message: "Data not found!" });
    }
    return res.json({
      status: true,
      message: "Updated successfully",
      data: await updated_data,
    });
  } catch (error) {
    return res.json({ status: false, error });
  }
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // try {
//     fs.opendir('images/File', (err, fileDes) => {
//       if (err) {
//         fs.mkdir(err.path, (err) => {
//           if (err) cb(true, "Provided directory not found!")
//           else cb(null, 'images/File')
//           console.log('error in storage', err, path)
//         })
//       }
//       fileDes.close()
//       cb(null, 'images/File')
//     })
//     // const open_dir = fs.opendirSync('images/File');
//     // console.log('open directories', open_dir)
//     // open_dir.closeSync()
//     // } catch (err) {
//     //   // console.log('destination', err)
//     //   // if (err.code = 'ENOENT') {
//     //   //   fs.mkdirSync(err.path);
//     //   // } else {
//     //   //   cb(true, "Provided directory not found!")
//     //   // }
//     // }
//     // cb(null, 'images/File');
//   },
//   filename: (req, file, cb) => {
//     console.log('fileName function', file.originalname)
//     cb(null, Date.now() + '-' + file.originalname.split(' ').join('_'));
//   }
// });
// router.post('/file', protectTo, async (req, res) => {
//   try {
//     await contentFileHandler(req, res, 'CREATE')
//   } catch (err) {
//     return res.json({status: false, })
//   }
// })

// router.put('/file', protectTo, async (req, res) => {
//   try {
//     contentFileHandler(req, res, 'UPDATE')
//   } catch (err) {
//     console.log("error---", err)
//   }
// })

router.get("/file", protectTo, async (req, res) => {
  try {
    const employeeId = req.loggedInUser.user_id;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data) {
      return res.json({ status: false, message: "No employee data" });
    }
    const {
      page = "1",
      status = "",
      fileType = "",
      fileId = "",
      limit = 10,
      skip = 0,
    } = req.body;

    let isFiltered = "DEFAULT";
    let filter = {
      company_id: emp_data.companyId,
      is_delete: "0",
      feedById: employeeId,
    };
    if (status) {
      filter.status = status;
      isFiltered = "COMPANY_ID";
    }
    if (fileType) {
      filter.fileType = fileType.toUpperCase();
      isFiltered = "FILE_TYPE";
    }
    if (fileId) {
      filter._id = fileId;
      let file_data = await File.findOne(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      if (!file_data) {
        return res.json({ status: false, message: "data not found!" });
      }
      return res.json({ status: true, message: "Data", result: file_data });
    } else {
      const [file_data, total_file_count] = await Promise.all([
        File.find(filter).limit(limit).skip(skip).sort({ _id: -1 }),
        File.countDocuments(filter),
      ]);
      if (!file_data.length) {
        return res.json({ status: false, message: "data not found!" });
      }
      return res.json({
        status: true,
        message: "Data",
        result: file_data,
        pageLength: Math.ceil(total_file_count / limit),
        count: total_file_count,
      });
    }
  } catch (error) {
    return res.json({ status: false, message: error });
  }
});

router.delete("/file/:id", protectTo, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.json({
        status: false,
        message: "Please provide the valid id",
      });
    const employeeId = req.loggedInUser.user_id;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data) {
      return res.json({ status: false, message: "No employee data" });
    }
    const findData = await File.findOne({
      _id: id,
      company_id: emp_data.companyId,
      feedById: employeeId,
      is_delete: "0",
    });
    if (!findData)
      return res.json({ status: false, message: "Data Not Found" });
    await File.findByIdAndUpdate(
      { _id: id, company_id: emp_data.companyId },
      { $set: { is_delete: "1" } }
    );
    return res.json({ status: true, message: "Deleted successfully" });
  } catch (error) {
    return res.json({ status: false, message: error });
  }
});

function writePdfPromise(file) {
  let fileName =
    Date.now() +
    "_" +
    file.originalname.substr(0, 6).split(" ").join("_") +
    "." +
    file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
  return new Promise((resolve, reject) => {
    fs.writeFile(`./images/File/${fileName}`, file.buffer, (err) => {
      if (err) reject(err);
      else {
        resolve(`${getBaseUrl()}images/File/${fileName}`);
      }
    });
  });
}

async function writeImagePromise(file) {
  let fileName =
    Date.now() +
    "_" +
    file.originalname.substr(0, 6).split(" ").join("_") +
    "." +
    file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
  return new Promise((resolve, reject) => {
    sharp(file.buffer)
      .resize(320, 240)
      .toFile(`./images/File/${fileName}`, (err) => {
        if (err) reject(err);
        else {
          resolve(`${getBaseUrl()}images/File/${fileName}`);
        }
      });
  });
}

// Create the multer instance
// const upload = multer({
//   storage: storage,
//   fileFilter: (data, file, cb) => {
//     console.log('file filter')
//     if (!file.originalname.toLowerCase().match(/\.(png|jpg|pdf)$/)) {
//       return cb(401)
//     }
//     cb(null, true)
//   },
//   limits: {
//     // fileSize: 10485760,
//     files: 5
//   }
// }).array('file');

// const contentFileHandler = function (req, res, action) {
//   upload(req, res, async function (data) {
//     console.log('filehandler', req.files)
//     let { title = "", fileType = "" } = req.body;
//     if (title == "" || fileType == "") return res.json({ status: false, message: "Please provide the required data" })
//     console.log('filehandler', req.files)

//     if (data instanceof multer.MulterError) {
//       if (data.code == 'LIMIT_UNEXPECTED_FILE' || 'LIMIT_FILE_COUNT') {
//         return res.json({ status: false, message: 'File uploading limit exceeded!' })
//       }
//       if (data.code == 'LIMIT_FILE_SIZE') {
//         return res.json({ status: false, message: 'Maximum 10MB file is allowed!' })
//       }
//     } else if (data == 401) {
//       return res.json({ status: false, message: 'Please upload image and pdf' })
//     }

//     const decodedToken = jwt.verify(req.token, "test");
//     const employee_id = decodedToken.user_id;

//     const emp_data = await Employee.findById({ _id: employee_id });

//     if (!emp_data) {
//       return res.json({ status: false, message: 'Employee data not found!' })
//     }
//     console.log('emp_data', emp_data)

//     const imageUrlData = [];
//     const pdfUrlData = [];

//     for (file of req.files) {
//       let ext = file.filename.substr(file.filename.lastIndexOf('.') + 1).toUpperCase();
//       if (ext == 'PDF') pdfUrlData.push(getBaseUrl() + 'images/file/' + file.filename);
//       else imageUrlData.push(getBaseUrl() + 'images/file/' + file.filename);
//     }

//     if (action == 'CREATE') {
//       const date = get_current_date().split(" ")[0];
//       const file_data = await File.create({
//         title,
//         image: imageUrlData || null,
//         company_id: emp_data.companyId,
//         date,
//         pdf: pdfUrlData || null,
//         feedBy: "EMPLOYEE",
//         feedById: employee_id,
//         fileType: fileType.toUpperCase(),
//         status: "Active"
//       });
//       // console.log('imageUrlData', file_data)
//       // console.log("file", req.files)
//       return res.json({ status: true, message: "File added successfully", data: file_data })
//     }
//     else if (action == 'UPDATE') {

//       const { id, title, fileType, status, body } = req.body;
//       if (id == "") return res.json({ status: false, message: "Please provide the id" })
//       let update_date = get_current_date();
//       let updated_file = { feedById: emp_data._id, update_date }

//       if (imageUrlData.length) {
//         updated_file.image = imageUrlData || null;
//       }
//       if (pdfUrlData.length) {
//         updated_file.pdf = pdfUrlData || null;
//       }
//       if (title) {
//         updated_file.title = title;
//       }
//       if (fileType) {
//         updated_file.fileType = fileType;
//       }
//       if (status) {
//         updated_file.status = status;
//       }
//       if (body) {
//         updated_file.body = body;
//       }
//       console.log(updated_file)
//       const updated_data = await File.findOneAndUpdate({ _id: id }, updated_file, { new: true });
//       return res.json({ status: true, message: "Updated successfully", data: updated_data })
//     }
//   })
// }

// router.post('/file', protectTo, (req, res) => {
//   try {
//     contentFileHandler(req, res, 'CREATE')
//   } catch (err) {
//     console.log("error---", err)
//   }
// })

// router.put('/file', protectTo, async (req, res) => {
//   try {
//     contentFileHandler(req, res, 'UPDATE')
//   } catch (err) {
//     console.log("error---", err)
//   }
// })

// router.get('/file', protectTo, async (req, res) => {
//   try {
//     const decodedToken = jwt.verify(req.token, "test");
//     console.log("req.body", req.body)
//     const employee_id = decodedToken.user_id;
//     const { status = "", fileId = "", limit = 10, skip = 0 } = req.body;
//     const emp_data = await Employee.findById({ _id: employee_id });

//     if (!emp_data) return res.json({ status: false, message: 'Employee data not found!' })
//     const filter = { company_id: emp_data.companyId, feedById: employee_id, is_delete: "0" };
//     if (status) filter.status = status;
//     console.log('filter1', filter)
//     if (fileId) {
//       // if (fileType.toUpperCase() == 'CATALOGUE') {
//       //   filter['image._id'] = fileId
//       // }
//       // else if (fileType.toUpperCase() == 'PDF') {
//       //   filter['pdf._id'] = fileId
//       // }
//       filter._id = fileId;
//       console.log('filter2', filter)
//       let file_data = await File.find(filter);
//       return res.json({ status: true, message: "Data", result: file_data })
//     } else {
//       const [file_data, total_file_count] = await Promise.all([
//         File.find(filter).skip(skip).limit(limit).sort({ _id: -1 }),
//         File.countDocuments(filter)
//       ]);
//       return res.json({ status: true, message: "Data", result: file_data, pageLength: Math.ceil(total_file_count / limit), count: total_file_count, page: skip / 10 + 1 })
//     }
//   } catch (err) {
//     console.log("error---", err)
//   }
// })

// router.delete('/file/:id', protectTo, async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log(id)
//     if (!id) return res.json({ status: false, message: "Please provide the valid id" });
//     const decodedToken = jwt.verify(req.token, "test");
//     const employee_id = decodedToken.user_id;
//     const emp_data = await Employee.findById({ _id: employee_id });
//     if (!emp_data) return res.json({ status: false, message: 'Employee data not found!' })

//     const findData = await File.find({ _id: id, company_id: emp_data.companyId, feedById: employee_id, is_delete: "0" })
//     console.log(findData)
//     if (!findData.length) return res.json({ status: false, message: "Data Not Found" })
//     await File.findByIdAndUpdate({ _id: id, company_id: emp_data.companyId, feedById: employee_id, is_delete: "0" }, { $set: { is_delete: "1", status: 'InActive' } });
//     return res.json({ status: true, message: "Deleted successfully" })
//   } catch (error) {
//   return res.json({status: false, message: error })
// }
// })

// SHARE-MEDIA SUB-MODULE
// router.post("/sharedMedia", protectTo, async (req, res) => {
//   const employeeId = req.loggedInUser.user_id;
//   let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
//   if (!emp_data) {
//     return res.json({ status: false, message: "No employee data" });
//   }
//   const { sharedWith = [], userType = "", media = "" } = req.body;
//   if (!sharedWith.length || !userType || !media)
//     res.json({
//       status: false,
//       message: `Please provide ${
//         !sharedWith.length
//           ? "user data whom to share"
//           : !userType
//           ? "type of user"
//           : "media url"
//       }`,
//     });
//   const updateShareCount = await File.findOneAndUpdate(
//     { _id: media },
//     { $inc: { sharedCount: 1 } }
//   );
//   console.log("updateShareCount", updateShareCount);
//   const sharedMedia = await SharedMedia.create({
//     sharedBy: {
//       _id: emp_data._id,
//       by: "EMPLOYEE",
//     },
//     company_id: emp_data.company_id,
//     sharedWith,
//     userType: userType.toUpperCase(),
//     media,
//   });
//   if (!sharedMedia) res.json({ status: false, message: "Try again!" });
//   res.json({ status: true, message: "Data is sucessfully created!" });
// });

// SHARE-MEDIA SUB-MODULE
router.post("/sharedMedia", protectTo, async (req, res) => {
  try {
    const employeeId = req.loggedInUser.user_id;
    let { sharedWith = "", userType = "", media = "" } = req.body;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data) {
      return errorHandler(res, 401, "You are not authorized user!");
    }
    const file = await File.findById(media);
    if (!file) {
      return errorHandler(res, 404, "File not found!");
    }

    console.log("body", req.body);
    if (!sharedWith || !media) {
      return errorHandler(
        res,
        400,
        `Please provide ${
          !sharedWith ? "user data whom to share" : "media url"
        }`
      );
    }
    userType = userType?.toUpperCase();
    if (userType == "LEAD") {
      userType = "Lead";
      let userData = await Lead.findOne({
        _id: sharedWith,
        assignToEmp: employeeId,
      });
      if (!userData) {
        return errorHandler(res, 404, "Lead not found!");
      }
    } else if (userType == "PARTY") {
      userType = "Party";
      let userData = await Party.findOne({
        _id: sharedWith,
        employee_id: employeeId,
      });
      if (!userData) {
        return errorHandler(res, 404, "Party not found!");
      }
    } else if (userType == "CUSTOMER") {
      userType = "Retailer";
      let userData = await Retailer.findOne({
        _id: sharedWith,
        assignToEmp: employeeId,
      });
      if (!userData) {
        return errorHandler(res, 404, "Customer not found!");
      }
    } else {
      return errorHandler(res, 400, "Please provide valid userType!");
    }
    const url =
      "https://crm.salesparrow.in/" +
      "lead_api/file/" +
      `${media + "/" + sharedWith}`;
    const updateShareCount = await File.findByIdAndUpdate(
      { _id: media },
      { $inc: { sharedCount: 1 } },
      { new: true }
    );
    console.log("updateShareCount", updateShareCount);
    const sharedMedia = await SharedMedia.create({
      sharedBy: {
        _id: employeeId,
        by: "EMPLOYEE",
      },
      company_id: emp_data.companyId,
      sharedWith,
      userType,
      media,
    });
    if (!sharedMedia) return res.json({ status: false, message: "Try again!" });
    return res.json({ status: true, data: { url, sharedMedia } });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

router.get("/sharedHistory/:id", protectTo, async (req, res) => {
  try {
    const employeeId = req.loggedInUser.user_id;
    let emp_data = await Employee.findOne({ _id: employeeId, is_delete: "0" });
    if (!emp_data) {
      return errorHandler(res, 404, "No employee data");
    }
    const company_id = emp_data.companyId;
    const fileId = req.params.id;
    if (!mongoose.isValidObjectId(fileId)) {
      return errorHandler(res, 401, "Provide valid id!");
    }
    const sharedCount = await File.findById(
      { _id: fileId },
      { sharedCount: 1 }
    );
    if (!sharedCount) {
      return res.status(400).json({
        status: false,
        message: "File not found!",
      });
    }

    console.log("companyId", company_id);
    console.log("fileId", fileId);
    const data = await SharedMedia.aggregate([
      {
        $match: {
          company_id: mongoose.Types.ObjectId(company_id),
          media: mongoose.Types.ObjectId(fileId),
          "sharedBy._id": employeeId,
        },
      },
      {
        $group: {
          _id: null,
          opened: { $sum: { $cond: ["$opened", 1, 0] } },
          unopened: { $sum: { $cond: ["$unopened", 1, 0] } },
          viewMultipleTime: { $max: "$openCount" },
        },
      },
    ]);
    if (!data.length) {
      return res.json({ status: false, message: "History not found!" });
    }
    return res.json({
      status: true,
      data: { ...data[0], sharedCount: sharedCount.sharedCount },
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

// FOLLOW_UP SUB-MODULE
router.post("/followUp", protectTo, async (req, res) => {
  try {
    let { type = "", description = "", date = "", leadId = "" } = req.body;
    var emp_id = req.loggedInUser.user_id;
    if (!leadId) {
      return errorHandler(res, 400, "lead_id require !");
    }
    if (!date || !type) {
      return errorHandler(res, 400, "Please provide valid data");
    }
    type = type.toUpperCase();
    console.log(
      "validation of type",
      ["PHONE", "NOTE", "MEETING", "MESSAGE"].includes(type)
    );
    if (!["PHONE", "NOTE", "MEETING", "MESSAGE"].includes(type)) {
      return errorHandler(res, 400, "Please provide valid type!");
    }
    const emp_data = await Employee.findOne({ _id: emp_id });
    if (!emp_data) {
      return errorHandler(res, 401, "Not Authorized!");
    }
    const lead_data = await Lead.findById({ _id: leadId });
    if (!lead_data) {
      return errorHandler(res, 404, "Lead not found!");
    }
    if (lead_data.assignToEmp !== emp_id) {
      return errorHandler(res, 404, "Lead is not assigned!");
    }
    console.log("adminData", emp_data);
    const followup = await LeadFollowUp.create({
      type,
      description,
      date: date.split(" ")[0],
      time: date.split(" ")[1],
      lead: leadId,
      admin: lead_data.assignToEmp,
      company_id: emp_data.companyId,
    });

    console.log("create FollowUp", !followup);
    if (!followup) {
      return errorHandler(res, 404, "Please try again!");
    }
    return res.status(201).json({
      status: true,
      message: "Data created successfully!",
    });
  } catch (error) {
    console.log("error", error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

router.post("/listFollowUp", protectTo, async (req, res) => {
  try {
    let { leadId = "", page = 1, limit = 20 } = req.body;
    if (!leadId) {
      return errorHandler(res, 400, "lead_id require!");
    }
    const user_id = req.loggedInUser.user_id;
    const emp_data = await Employee.findOne({ _id: user_id });
    if (!emp_data) {
      return errorHandler(res, 404, "Not Authorized!");
    }
    const lead_data = await Lead.findById({ _id: leadId });
    if (!lead_data) {
      return errorHandler(res, 404, "Lead not found!");
    }
    if (lead_data.assignToEmp !== user_id) {
      return errorHandler(res, 401, "Lead is not assigned!");
    }
    let condition = {
      is_delete: "0",
      company_id: emp_data.companyId,
      lead: leadId,
      admin: user_id,
    };

    const totalData = await LeadFollowUp.countDocuments(condition);
    console.log("totalData", totalData, condition);
    if (!totalData) {
      return res.status(401).json({
        status: false,
        message: "Data not found!",
      });
    }
    const lead_g_data = await LeadFollowUp.find(condition)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, time: 1 });

    return res.json({
      status: true,
      message: "Data Found",
      pageLength: Math.ceil(totalData / limit),
      count: totalData,
      Data: lead_g_data,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

router.put("/followUp", protectTo, async (req, res) => {
  try {
    console.log("body", req.body);
    let { type = "", description = "", date = "", id = "" } = req.body;
    const user_id = req.loggedInUser.user_id;

    console.log("type description", type, description);
    if (!id) {
      return errorHandler(res, 400, "FollowUp id require!");
    }
    const emp_data = await Employee.findById({ _id: user_id });
    if (!emp_data || emp_data.is_deleted == "1") {
      return errorHandler(res, 401, "Not Authorized!");
    }

    let updatingData = {};
    updatingData.admin = user_id;
    updatingData.Updated_date = get_current_date();
    if (type) {
      type = type.toUpperCase();
      if (!["PHONE", "NOTE", "MEETING", "MESSAGE"].includes(type)) {
        return res.status(401).json({
          status: false,
          message: "Please provide valid type",
        });
      }
      updatingData.type = type;
    }
    if (description) {
      updatingData.description = description.trim();
    }
    if (date) {
      updatingData.date = date.split(" ")[0];
      if (date.split(" ")[1]) {
        updatingData.time = date.split(" ")[1];
      }
    }
    console.log("updatingData", updatingData);
    const followUp = await LeadFollowUp.findByIdAndUpdate(
      { _id: id },
      updatingData,
      { new: true }
    );
    console.log("updated followUp", followUp);
    if (!followUp) {
      return errorHandler(res, 400, "Please provide valid id!");
    }
    return res.status(200).json({
      status: true,
      message: "Update successfully",
      results: followUp,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

router.get("/listFollowUpLogs", protectTo, async (req, res) => {
  try {
    const user_id = req.loggedInUser.user_id;
    const emp_data = await Employee.findById({ _id: user_id });
    const currentDate = get_date().split(" ")[0];
    const upcomingDate = get_date(
      new Date(Date.now() + 7 * 24 * 3600 * 1000)
    ).split(" ")[0];
    if (!emp_data) {
      return errorHandler(res, 404, "User not found!");
    }

    const assignLeadCount = await Lead.countDocuments({ assignToEmp: user_id });

    const combinedCounts = await LeadFollowUp.aggregate([
      {
        $match: {
          is_delete: "0",
          company_id: emp_data.companyId,
          admin: user_id,
        },
      },
      {
        $lookup: {
          from: "leads",
          localField: "lead",
          foreignField: "_id",
          as: "lead",
        },
      },
      {
        $facet: {
          overdue: [
            {
              $match: {
                date: { $lt: `${currentDate}` },
              },
            },
            // {
            //   $count: "overdueCount",
            // },
          ],
          upcoming: [
            {
              $match: {
                date: { $gte: `${currentDate}`, $lt: `${upcomingDate}` },
              },
            },
            // {
            //   $count: "upcomingCount",
            // },
          ],
          today: [
            {
              $match: {
                date: { $eq: `${currentDate}` },
              },
            },
            // {
            //   $count: "someDayCount",
            // },
          ],
        },
      },
      // {
      //   $project: {
      //     overdue: { $arrayElemAt: ["$overdue.overdueCount", 0] },
      //     upcoming: { $arrayElemAt: ["$upcoming.upcomingCount", 0] },
      //     someDay: { $arrayElemAt: ["$someDay.someDayCount", 0] },
      //   },
      // },
    ]);

    return res.json({
      status: true,
      data: {
        assignLead: assignLeadCount,
        ...combinedCounts[0],
      },
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

function get_date(today = new Date()) {
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

module.exports = router;
