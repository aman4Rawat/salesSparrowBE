const express = require("express");
const sharp = require("sharp");
const opn = require("opn");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
// const { exec } = require("child_process");
// const axios = require("axios");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const File = mongoose.model("File");
const Admin = mongoose.model("AdminInfo");
const Lead = mongoose.model("Lead");
const Banner = mongoose.model("Banner");
const Mapping = mongoose.model("Mapping");
const SharedMedia = mongoose.model("SharedMedia");
const LeadBanner = mongoose.model("LeadBanner");
const Route = mongoose.model("Route");
const PartyGroup = mongoose.model("PartyGrouping");
const LeadGroup = mongoose.model("LeadGroup");
const Message = mongoose.model("Message");
// const Leadfollow = mongoose.model("leadfollow");
const LeadFollowUp = mongoose.model("FollowUp");
const LeadGroupItem = mongoose.model("LeadGroupItem");
const Role = mongoose.model("role");
const CustomerType = mongoose.model("CustomerType");
const Party = mongoose.model("Party");
const Retailer = mongoose.model("Retailer");
const Beat = mongoose.model("Beat");

const jwt = require("jsonwebtoken");
const router = express.Router();
const getBaseUrl = require("../../superadmin/utils/getBaseUrl");
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
    if (!authHeader) console.log("token not provided or user not logged in");
    const authHeaderStringSplit = authHeader.split(" ");
    if (
      !authHeaderStringSplit[0] ||
      authHeaderStringSplit[0].toLowerCase() !== "bearer" ||
      !authHeaderStringSplit[1]
    )
      console.log("token not provided or user not logged in");
    const token = authHeaderStringSplit[1];
    const decodedToken = jwt.verify(token, "test");
    return decodedToken;
  } catch (error) {
    throw error;
  }
};

router.post("/lead_list", protectTo, async (req, res) => {
  const {
    lead_id = "",
    search = "",
    state = "",
    leadSource = "",
    lead_stage = "",
    lead_potential = "",
    customer_grp = "",
    employee_id = "",
    page = 1,
    limit = 20,
  } = req.body;
  var user_id = req.loggedInUser.user_id;
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
        // condition.is_customer = is_customer;
        if (search != "") {
          var regex = new RegExp(search, "i");
          condition.leadName = regex;
        }
        if (state != "") {
          condition.state = state;
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
        if (lead_id != "") {
          condition._id = lead_id;
        }
        Lead.find(condition)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort({ _id: -1 })
          .exec()
          .then(async (lead_data) => {
            if (lead_data.length > 0) {
              let counInfo = 0;
              for (let i = 0; i < lead_data.length; i++) {
                await (async function (rowData) {
                  if (rowData.state != "") {
                    var state_data = await Location.findOne({
                      id: rowData.state,
                    });
                    var sate_name = state_data.name;
                  } else {
                    var sate_name = "";
                  }
                  if (rowData.city != "") {
                    var city_data = await Location.findOne({
                      id: rowData.city,
                    });
                    var city_name = city_data.name;
                  } else {
                    var city_name = "";
                  }
                  if (rowData.assignToEmp != "") {
                    var emp_data = await Employee.findById(rowData.assignToEmp);
                    var emp_name = emp_data.employeeName;
                  } else {
                    var emp_name = "";
                  }
                  // var leadfollow_data = await LeadFollowUp.findOne({
                  //   lead_id: rowData._id,
                  // });
                  console.log("date compare", get_date(rowData.next_followup).split(" ")[0], get_date().split(" ")[0])
                  let status;
                  if (get_date(rowData.next_followup).split(" ")[0] == get_date().split(" ")[0]){
                     status = "Today"
                  } else if (get_date(rowData.next_followup).split(" ")[0] > get_date().split(" ")[0] ){
                    status = "Upcoming"
                  } else {
                    status = "Overdue"
                  }
                  var u_data = {
                    _id: rowData._id,
                    admin_id: rowData.admin_id,
                    leadName: rowData.leadName,
                    displayName: rowData.displayName,
                    mobileNumber: rowData.mobileNumber,
                    email: rowData.email,
                    pincode: rowData.pincode,
                    state: rowData.state,
                    last_follow_date: rowData.last_followup || "",
                    next_follow_date: rowData.next_followup || "",
                    followup_Status: status || "N/A" ,
                    sate_name: sate_name ?? "",
                    city_name: city_name ?? "",
                    emp_name: emp_name ?? "",
                    city: rowData.city,
                    leadSource: rowData.leadSource,
                    addBy: rowData.addBy,
                    note: rowData.note,
                    assignToEmp: rowData.assignToEmp,
                    Created_date: rowData.Created_date,
                    Updated_date: rowData.Updated_date,
                    is_delete: rowData.is_delete,
                    status: rowData.status,
                  };
                  list1.push(u_data);
                })(lead_data[i]);
                counInfo++;
                if (counInfo == lead_data.length) {
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
});

// Update lead  --  Pravas Chandra Nayak - 13-01-2023

// router.post('/update_lead',async(req,res) => {
//   var token           = (req.get('Authorization')) ? req.get('Authorization') : "";
//   var leadName        = (req.body.leadName) ? req.body.leadName : "";
//   var displayName     = (req.body.displayName) ? req.body.displayName : "";
//   var mobileNumber    = (req.body.mobileNumber) ? req.body.mobileNumber : "";
//   var email           = (req.body.email) ? req.body.email : "";
//   var state           = (req.body.state) ? req.body.state : "";
//   var city            = (req.body.city) ? req.body.city : "";
//   var pincode         = (req.body.pincode) ? req.body.pincode : "";
//   var leadSource      = (req.body.leadSource) ? req.body.leadSource : "";
//   var addBy           = (req.body.addBy) ? req.body.addBy : "";
//   var note            = (req.body.note) ? req.body.note : "";
//   var assignToEmp     = (req.body.assignToEmp) ? req.body.assignToEmp : "";
//   var status          = (req.body.status) ? req.body.status : "";
//   var lead_id         = (req.body.lead_id) ? req.body.lead_id : "";
//   var is_customer     = (req.body.is_customer) ? req.body.is_customer : "";
//   if (token != "") {
//     if (lead_id != "") {
//       const decoded = await getDecodedToken(token);
//       var user_id         = decoded.user_id;
//       Admin.find({_id:user_id}).exec().then(async user_info=>{
//         if (user_info.length < 1) {
//           res.status(401).json({
//            status:false,
//            message:"User not found !",
//            results:null,
//          })
//         }else{
//           var user_data                   = {};
//           user_data.admin_id              = user_id;
//           user_data.Updated_date          = get_current_date();
//           if (is_customer != "") {
//             user_data.is_customer         = is_customer;
//           }
//           if (leadName != "") {
//             user_data.leadName            = leadName;
//           }
//           if (displayName != "") {
//             user_data.displayName         = displayName;
//           }
//           if (mobileNumber != "") {
//             user_data.mobileNumber        = mobileNumber;
//           }
//           if (email != "") {
//             user_data.email               = email;
//           }
//           if (pincode != "") {
//             user_data.pincode             = pincode;
//           }
//           if (state != "") {
//             user_data.state               = state;
//           }
//           if (city != "") {
//             user_data.city                = city;
//           }
//           if (leadSource != "") {
//             user_data.leadSource          = leadSource;
//           }
//           if (addBy != "") {
//             user_data.addBy               = addBy;
//           }
//           if (note != "") {
//             user_data.note                = note;
//           }
//           if (assignToEmp != "") {
//             user_data.assignToEmp         = assignToEmp;
//           }
//           if (status != "") {
//             user_data.status              = status;
//           }
//           Lead.findOneAndUpdate({_id:lead_id}, user_data, { new: true }, (err, doc) => {
//             if (doc) {
//               res.status(200).json({
//                 status:true,
//                 message:"Update successfully",
//                 results:doc,
//               })
//             }else{
//               res.status(200).json({
//                 status:true,
//                 message:"Update error !",
//                 results:null,
//               })
//             }
//           });
//         }
//       });
//     }else{
//       return res.json({
//         status:false,
//         message:"lead_id require !",
//         results:null,
//       });
//     }
//   }else{
//     return res.json({
//       status:false,
//       message:"token require !",
//       results:null,
//     });
//   }
// });

// Update lead  --  Pravas Chandra Nayak - 13-01-2023

router.post(
  "/update_lead_banner",
  imageUpload.fields([{ name: "file" }]),
  async (req, res) => {
    var token = req.get("Authorization") ? req.get("Authorization") : "";
    var type = req.body.type ? req.body.type : "";
    var name = req.body.name ? req.body.name : "";
    var date = req.body.date ? req.body.date : "";
    var status = req.body.status ? req.body.status : "";
    var leadBanner_id = req.body.leadBanner_id ? req.body.leadBanner_id : "";
    var is_delete = req.body.is_delete ? req.body.is_delete : "";
    if (token != "") {
      if (leadBanner_id != "") {
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
              var user_data = {};
              user_data.admin_id = user_id;
              user_data.Updated_date = get_current_date();
              if (type != "") {
                user_data.type = type;
              }
              if (name != "") {
                user_data.name = name;
              }
              if (date != "") {
                user_data.date = date;
              }
              if (req.files.file) {
                user_data.file = getBaseUrl() + req.files.file[0].path;
              }
              if (status != "") {
                user_data.status = status;
              }
              if (is_delete != "") {
                user_data.is_delete = is_delete;
              }
              LeadBanner.findOneAndUpdate(
                { _id: leadBanner_id },
                user_data,
                { new: true },
                (err, doc) => {
                  if (doc) {
                    res.status(200).json({
                      status: true,
                      message: "Update successfully",
                      results: doc,
                    });
                  } else {
                    res.status(200).json({
                      status: true,
                      message: "Update error !",
                      results: null,
                    });
                  }
                }
              );
            }
          });
      } else {
        return res.json({
          status: false,
          message: "leadBanner_id require !",
          results: null,
        });
      }
    } else {
      return res.json({
        status: false,
        message: "token require !",
        results: null,
      });
    }
  }
);

router.post("/add_LeadGroupData", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var group_id = req.body.group_id ? req.body.group_id : "";
  var lead_id = req.body.lead_id ? req.body.lead_id : "";
  if (token != "") {
    if (group_id != "") {
      if (lead_id != "") {
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
              LeadGroupData.deleteMany(
                { group_id: group_id },
                (err, obj) => {}
              );
              var lead_id_array = lead_id.split(",");
              for (let i = 0; i < lead_id_array.length; i++) {
                await (async function (rowData_2) {
                  var user_data = new LeadGroupData();
                  user_data.admin_id = user_id;
                  user_data.group_id = group_id;
                  user_data.lead_id = rowData_2;
                  user_data.Created_date = get_current_date();
                  user_data.status = "Active";
                  user_data.save((err1, doc) => {
                    console.log(doc);
                  });
                })(lead_id_array[i]);
              }
              res.status(200).json({
                status: true,
                message: "Add successfully",
                results: null,
              });
            }
          });
      } else {
        return res.json({
          status: false,
          message: "lead_id require !",
          results: null,
        });
      }
    } else {
      return res.json({
        status: false,
        message: "group_id require !",
        results: null,
      });
    }
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.post("/leadGroup_list", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var search = req.body.search ? req.body.search : "";
  var page = req.body.page != "" ? req.body.page : 1;
  var limit = req.body.limit != "" ? req.body.limit : 20;
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
          LeadGroup.find(condition)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ _id: -1 })
            .exec()
            .then(async (lead_g_data) => {
              if (lead_g_data.length > 0) {
                let counInfo = 0;
                for (let i = 0; i < lead_g_data.length; i++) {
                  await (async function (rowData) {
                    var leadGroup_data = await LeadGroupData.find({
                      group_id: rowData._id,
                    });
                    var u_data = {
                      _id: rowData._id,
                      admin_id: rowData.admin_id,
                      name: rowData.name,
                      colours: rowData.colours,
                      Created_date: rowData.Created_date,
                      Updated_date: rowData.Updated_date,
                      is_delete: rowData.is_delete,
                      status: rowData.status,
                      data: [],
                    };
                    if (leadGroup_data.length > 0) {
                      for (let j = 0; j < leadGroup_data.length; j++) {
                        await (async function (prowData) {
                          var is_lead_array = [];
                          var is_customer_array = [];
                          var lead_data = await Lead.findOne({
                            _id: prowData.lead_id,
                          });
                          if (lead_data) {
                            if (lead_data.is_customer == "0") {
                              is_lead_array.push(prowData.lead_id);
                            } else {
                              is_customer_array.push(prowData.lead_id);
                            }
                          }
                          let paymentData = {
                            lead: is_lead_array.length,
                            customer: is_customer_array.length,
                          };
                          u_data["data"].push(paymentData);
                          if (leadGroup_data.length == j + 1) {
                            list1.push(u_data);
                          }
                        })(leadGroup_data[j]);
                      }
                    } else {
                      list1.push(u_data);
                    }
                    //list1.push(u_data);
                  })(lead_g_data[i]);
                  counInfo++;
                  if (counInfo == lead_g_data.length) {
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

router.post("/update_lead_group", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var colours = req.body.colours ? req.body.colours : "";
  var name = req.body.name ? req.body.name : "";
  var status = req.body.status ? req.body.status : "";
  var leadgroup_id = req.body.leadgroup_id ? req.body.leadgroup_id : "";
  var is_delete = req.body.is_delete ? req.body.is_delete : "";
  if (token != "") {
    if (leadgroup_id != "") {
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
            var user_data = {};
            user_data.admin_id = user_id;
            user_data.Updated_date = get_current_date();
            if (colours != "") {
              user_data.colours = colours;
            }
            if (name != "") {
              user_data.name = name;
            }
            if (status != "") {
              user_data.status = status;
            }
            if (is_delete != "") {
              user_data.is_delete = is_delete;
            }
            LeadGroup.findOneAndUpdate(
              { _id: leadgroup_id },
              user_data,
              { new: true },
              (err, doc) => {
                if (doc) {
                  res.status(200).json({
                    status: true,
                    message: "Update successfully",
                    results: doc,
                  });
                } else {
                  res.status(200).json({
                    status: true,
                    message: "Update error !",
                    results: null,
                  });
                }
              }
            );
          }
        });
    } else {
      return res.json({
        status: false,
        message: "leadgroup_id require !",
        results: null,
      });
    }
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.post("/add_lead", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var leadName = req.body.leadName ? req.body.leadName : "";
  var displayName = req.body.displayName ? req.body.displayName : "";
  var mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : "";
  var email = req.body.email ? req.body.email : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var pincode = req.body.pincode ? req.body.pincode : "";
  var deal_value = req.body.deal_value ? req.body.deal_value : "";
  var lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
  var customer_grp = req.body.customer_grp ? req.body.customer_grp : "";
  var currency = req.body.currency ? req.body.currency : "";
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
  if (assignToEmp == "")
    return res.json({ status: false, message: "Please give assignToEmp" });
  if (token != "") {
    const decoded = await getDecodedToken(token);
    var user_id = decoded.user_id;
    let date = get_current_date().split(" ")[0];
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
          let state_data = await Location.findOne({ id: lead_data[i].state });
          let city_data = await Location.findOne({ id: lead_data[i].city });
          var lead_data = new Lead();
          lead_data.company_id = user_id;
          lead_data.leadName = leadName;
          lead_data.displayName = displayName;
          lead_data.mobileNumber = mobileNumber;
          lead_data.deal_value = deal_value;
          lead_data.email = email;
          lead_data.pincode = pincode;
          lead_data.state = state;
          lead_data.date = date;
          lead_data.customer_grp = customer_grp;
          lead_data.currency = currency;
          lead_data.lead_potential = lead_potential;
          lead_data.city = city;
          lead_data.state_name = state_data ? state_data.name : "";
          lead_data.city_name = city_data ? city_data.name : "";
          lead_data.leadSource = leadSource;
          lead_data.lead_stage = lead_stage;
          // lead_data.addBy               = addBy;
          lead_data.note = note;
          lead_data.assignToEmp = assignToEmp;
          lead_data.Created_date = get_current_date();
          // lead_data.status              = "InActive";
          lead_data.save(async (err1, doc) => {
            if (doc) {
              let new_lead_grp_item_data = await LeadGroupItem.create({
                company_id: user_id,
                grp_id: customer_grp,
                lead_id: doc._id,
                date: date,
                Created_date: get_current_date(),
                Updated_date: get_current_date(),
                status: "Active",
              });
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
});

router.post("/add_lead_group", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  let colour = req.body.colour ? req.body.colour : "";
  let grp_name = req.body.grp_name ? req.body.grp_name : "";
  let lead_id_arr = req.body.lead_id_arr ? req.body.lead_id_arr : [];
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let user_id = decoded.user_id;
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
          let date = get_current_date().split(" ")[0];
          let grp_data = await LeadGroup.findOne({ grp_name });
          if (grp_data)
            return res.json({
              status: false,
              message: "Group name already taken!",
            });
          let new_lead_grp = await LeadGroup.create({
            company_id: user_id,
            colour: colour,
            grp_name: grp_name,
            date: date,
            Created_date: get_current_date(),
            Updated_date: get_current_date(),
            status: "Active",
          });
          for (let i = 0; i < lead_id_arr.length; i++) {
            let new_lead_grp_item_data = await LeadGroupItem.create({
              company_id: user_id,
              grp_id: new_lead_grp._id,
              lead_id: lead_id_arr[i],
              date: date,
              Created_date: get_current_date(),
              Updated_date: get_current_date(),
              status: "Active",
            });
          }
          return res.json({
            status: true,
            message: "Group created successfuly",
            result: new_lead_grp,
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

router.post("/edit_lead_grp", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let user_id = `${decoded.user_id}`;
    console.log(typeof user_id);
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
          let date = get_current_date().split(" ")[0];
          let lead_grp_id = req.body.lead_grp_id ? req.body.lead_grp_id : "";
          let grp_name = req.body.grp_name ? req.body.grp_name : "";
          let colour = req.body.colour ? req.body.colour : "";
          let updated_grp = {};
          if (grp_name != "") {
            updated_grp.grp_name = grp_name;
          }
          if (colour != "") {
            updated_grp.colour = colour;
          }
          updated_grp.Updated_date = get_current_date();
          await LeadGroup.findOneAndUpdate({ _id: lead_grp_id }, updated_grp, {
            new: true,
          });
          let lead_id_arr = req.body.lead_id_arr ? req.body.lead_id_arr : [];
          await LeadGroupItem.deleteMany({ grp_id: lead_grp_id });
          for (let i = 0; i < lead_id_arr.length; i++) {
            let new_lead_grp_item_data = await LeadGroupItem.create({
              company_id: user_id,
              grp_id: lead_grp_id,
              lead_id: lead_id_arr[i],
              date: date,
              Created_date: get_current_date(),
              Updated_date: get_current_date(),
              status: "Active",
            });
          }
          return res.json({
            status: true,
            message: "Group edited successfuly",
          });
        }
      });
  } else {
    res.json({ status: false, message: "Token is required!" });
  }
});

router.post("/get_leads", protectTo, async (req, res) => {
  let {
    leadSource = "",
    type = "",
    page = 1,
    limit = 20,
    assignToEmp = "",
    month = 0,
  } = req.body;

  let user_id = req.loggedInUser.user_id;
  const user_info = await Admin.findById(user_id);
  if (!user_info) {
    return errorHandler(res, 401, "User not found!");
  }
  let condition = { is_delete: "0" };
  if (leadSource != "") {
    condition.leadSource = leadSource;
  }
  if (assignToEmp != "") {
    if (!mongoose.isValidObjectId(assignToEmp)) {
      return errorHandler(res, 400, "Please provide valid employeeId");
    }
    condition.assignToEmp = assignToEmp;
  }
  if (month != "") {
    if (![1, 3, 6, 12].includes(month)) {
      month = 0;
    }
    const year = new Date().getFullYear();
    const date = get_date(new Date(new Date(year, -month)));
    condition.createdAt = { $gt: date };
  }

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
    if (user_id != "") {
      condition.company_id = user_id;
    }
    console.log("****condition**********", condition);
    let lead_data = await Lead.find(condition)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    console.log("leaddata************", lead_data);
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
      { open: { leads: open, deal_value: open_deal_value } },
      {
        contacted: {
          leads: contacted,
          deal_value: contacted_deal_value,
        },
      },
      {
        qualified: {
          leads: qualified,
          deal_value: qualified_deal_value,
        },
      },
      { won: { leads: won, deal_value: won_deal_value } },
      { loose: { leads: loose, deal_value: loose_deal_value } },
    ];
    return res.json({ status: true, message: "Data", result: data });
  } else if (type == "leadpotential") {
    let high = 0;
    let medium = 0;
    let low = 0;
    condition.is_delete = "0";
    if (user_id != "") {
      condition.company_id = user_id;
    }
    let lead_data = await Lead.find(condition)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    for (let i = 0; i < lead_data.length; i++) {
      if (lead_data[i].lead_potential == "Low") {
        low++;
      } else if (lead_data[i].lead_potential == "Medium") {
        medium++;
      } else if (lead_data[i].lead_potential == "High") {
        high++;
      }
    }
    let data = {
      low: low,
      medium: medium,
      high: high,
    };
    return res.json({ status: true, message: "Data", result: data });
  } else if (type == "customergrp") {
    if (user_id != "") {
      condition.company_id = user_id;
    }
    let list = [];
    let lead_data = await Lead.find(condition)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    let lead_grp_data = await LeadGroup.find({
      company_id: user_id,
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
    list.push({ total_leads: lead_data.length });
    return res.json({ status: true, message: "Data", result: list });
  } else if (type == "leadsourcelist") {
    let facebook_leads = 0;
    let instagram_leads = 0;
    let indiamart_leads = 0;
    let website_leads = 0;
    let manual_leads = 0;
    let tradeindia_leads = 0;
    if (user_id != "") {
      condition.company_id = user_id;
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
    let data = {
      facebook: facebook_leads,
      instagram: instagram_leads,
      indiamart: indiamart_leads,
      website: website_leads,
      manual: manual_leads,
      tradeindia: tradeindia_leads,
    };
    return res.json({
      status: true,
      message: "Data",
      result: data,
      page_length: Math.ceil(count / limit),
    });
  } else {
    return res.json({ status: false, message: "No Data", result: [] });
  }
});

router.post("/get_clients", protectTo, async (req, res) => {
  const user_id = req.loggedInUser.user_id;

  let { status = "", type = "", page = 1, limit = 20 } = req.body;

  const admin_data = await Admin.findById(user_id);

  if (!admin_data) {
    return errorHandler(res, 401, "User not found!");
  }

  if (type == "customers") {
    let sub_type = req.body.sub_type ? req.body.sub_type : "";
    if (sub_type == "retailers") {
      let { employee_id = "", beat_id = "" } = req.body;
      let condition = { company_id: user_id, is_delete: "0" };
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
          let count = await Retailer.countDocuments(condition);
          for (let i = 0; i < count; i++) {
            let route_data = await Route.findOne({
              _id: retailer_data[i].route_id,
            });
            let city_data = await Location.findOne({ id: route_data.city });
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
            total: count,
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
          for (let i = 0; i < retailer_list[0].length; i++) {
            let route_data = Route.findOne({
              _id: retailer_list[0][i].route_id,
            });
            let city_data = Location.findOne({ id: route_data.city });
            let beat_data = await Beat.find({ _id: beat_id });
            let u_data = {
              _id: retailer_list[0][i]._id,
              customer_name: retailer_list[0][i].customerName,
              city: city_data.name,
              beat_name: beat_data.beatName,
              mobile_number: retailer_list[0][i].mobileNo,
              status: retailer_list[0][i].status,
            };
            list.push(u_data);
          }
          return res.json({
            status: true,
            message: "Data",
            result: list,
            total: retailer_list[0].length,
            page_length: Math.ceil(retailer_list[0].length / limit),
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
            total: count,
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
          console.log("retailer_list", retailer_list);
          for (let i = 0; i < retailer_list[0].length; i++) {
            let route_data = Route.findOne({
              _id: retailer_list[0][i].route_id,
            });
            let city_data = Location.findOne({ id: route_data.city });
            let beat_data = await Beat.findOne({ _id: beat_id });
            let u_data = {
              _id: retailer_list[0][i]._id,
              customer_name: retailer_list[0][i].customerName,
              city: city_data.name,
              beat_name: beat_data.beatName,
              mobile_number: retailer_list[0][i].mobileNo,
              status: retailer_list[0][i].status,
            };
            list.push(u_data);
          }
          return res.json({
            status: true,
            message: "Data",
            result: list,
            total: retailer_list[0].length,
            page_length: Math.ceil(retailer_list[0].length / limit),
          });
        }
      }
    } else if (sub_type == "parties") {
      let condition = { company_id: user_id, is_delete: "0" };
      let party_type = req.body.party_type ? req.body.party_type : "";
      let status = req.body.status ? req.body.status : "";
      let state = req.body.state ? req.body.state : "";
      if (party_type != "") {
        condition.partyType = party_type;
      }
      if (state != "") {
        condition.state = state;
      }
      if (status != "") {
        condition.status = status;
      }
      let party_data = await Party.find(condition)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      let total_party_data = await Party.find(condition);
      let count = total_party_data.length;
      let list = [];
      for (let i = 0; i < party_data.length; i++) {
        let city_data = await Location.findOne({
          id: party_data[i].city,
        });
        let u_data = {
          _id: party_data[i]._id,
          party_name: party_data[i].firmName,
          city: city_data.name,
          mobile_number: party_data[i].mobileNo,
          status: party_data[i].status,
        };
        list.push(u_data);
      }
      return res.json({
        status: true,
        message: "Data",
        result: list,
        page_length: Math.ceil(count / limit),
        total: count,
      });
    } else {
      return res.json({
        status: false,
        message: "Please provide sub type",
      });
    }
  } else if (type == "leads") {
    let {
      lead_stage = "",
      lead_potential = "",
      leadSource = "",
      customer_grp = "",
      search = "",
      status = "",
      state = "",
      employee_id = "",
    } = req.body;
    var list1 = [];
    var condition = {
      company_id: user_id,
      is_delete: "0",
    };
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
    let count = await Lead.countDocuments(condition);
    if (count < 1)
      return res.status(200).json({
        status: false,
        message: "Not Available !",
        result: list1,
      });
    let list = [];
    for (let i = 0; i < lead_data.length; i++) {
      let state_data = await Location.findOne({
        id: lead_data[i].state,
      });
      let emp_data = await Employee.findById(lead_data[i].assignToEmp);
      let lead_grp_data = await LeadGroup.findById(lead_data[i].customer_grp);
      // const currentDate = get_date();
      // var leadfollow_data = await LeadFollowUp.find({
      //   lead: lead_data[i]._id,
      //   date: { $lte: currentDate.split(" ")[0] },
      //   time: { $lte: currentDate.split(" ")[1] },
      // });
      console.log("***********leadFollowUpDate**********", lead_data[i].last_followup);
      var u_data = {
        _id: lead_data[i]._id,
        company_id: lead_data[i].company_id,
        leadName: lead_data[i].leadName,
        mobileNumber: lead_data[i].mobileNumber,
        state: {
          id: lead_data[i].state,
          name: state_data ? state_data.name : "",
        },
        leadSource: lead_data[i].leadSource,
        assignToEmp: emp_data.employeeName,
        lead_potential: lead_data[i].lead_potential,
        lead_stage: lead_data[i].lead_stage,
        lead_grp: lead_grp_data ? lead_grp_data.grp_name : "NA",
        last_follow_date: lead_data[i].last_followup || "NA",
        displayName: lead_data[i].displayName,
        email: lead_data[i].email,
        pincode: lead_data[i].pincode,
        currency: lead_data[i].currency,
        note: lead_data[i].note,
      };
      list.push(u_data);
    }
    return res.json({
      status: true,
      message: "Data",
      result: list,
      page_length: Math.ceil(count / limit),
      total: count,
    });
  } else if (type == "groups") {
    const { skip = 0, limit = 10 } = req.body;
    // let list = [];
    let date = get_current_date().split(" ")[0];

    const data = Promise.all([
      Lead.countDocuments({
        company_id: user_id,
        is_delete: "0",
        createdAt: { $gte: date },
      }),
      LeadGroup.find({
        company_id: user_id,
        is_delete: "0",
      }),
      LeadGroup.countDocuments({
        company_id: user_id,
        is_delete: "0",
      }),
      LeadFollowUp.find(
        {
          is_delete: "0",
          updatedAt: { $gte: date },
        },
        { type: 1, description: 1, date: 1, time: 1, lead: 1 }
      )
        .skip(skip)
        .limit(limit),
    ]);

    const new_leads = (await data)[0];
    const grp_data = (await data)[1];
    const count = (await data)[2];
    const recentActivity = (await data)[3];

    console.log("***data*****", new_leads, grp_data, count);
    // await new_leads;
    // await grp_data;
    // await count;
    // let new_lead_data = await Lead.find({
    //   company_id: user_id,
    //   is_delete: "0",
    //   date: date,
    // });
    // let new_leads = new_lead_data.length;
    // let grp_data = await LeadGroup.find({
    //   company_id: user_id,
    //   is_delete: "0",
    // })
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit);
    // let count = await LeadGroup.countDocuments({
    //   company_id: user_id,
    //   is_delete: "0",
    // });
    const list = Promise.all(
      grp_data.map((grp_data) => {
        let leads_count = LeadGroupItem.find({
          grp_id: grp_data._id,
        });
        return {
          lead_grp_name: grp_data.grp_name,
          id: grp_data._id,
          // lead_arr:leads_count?leads_count:[],
          lead_grp_color: grp_data.colour,
          leads: leads_count.length,
        };
      })
    );
    // for (let i = 0; i < grp_data.length; i++) {
    //   let leads_count = await LeadGroupItem.find({
    //     grp_id: grp_data[i]._id,
    //   });
    //   let u_data = {
    //     lead_grp_name: grp_data[i].grp_name,
    //     id: grp_data[i]._id,
    //     // lead_arr:leads_count?leads_count:[],
    //     lead_grp_color: grp_data[i].colour,
    //     leads: leads_count.length,
    //   };
    //   list.push(u_data);
    // }
    // list.push({new_leads:new_leads})
    return res.json({
      status: true,
      message: "Data",
      result: await list,
      new_leads: new_leads,
      page_length: Math.ceil(count / limit),
      total: count,
      recentActivity,
    });
  } else if (type == "teams") {
    let list = [];
    let emp_data = await Employee.find({
      companyId: user_id,
      is_delete: "0",
    })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    let total_emp_data = await Employee.find({
      companyId: user_id,
      is_delete: "0",
    });
    let count = total_emp_data.length;
    for (let i = 0; i < emp_data.length; i++) {
      let state_data = await Location.findOne({
        id: emp_data[i].headquarterState,
      });
      let role_data = await Role.findOne({ _id: emp_data[i].roleId });
      let u_data = {
        emp_name: emp_data[i].employeeName,
        emp_id: emp_data[i]._id,
        designation: role_data ? role_data.rolename : "NA",
        state: state_data.name,
        phone: emp_data[i].phone || "NA",
      };
      list.push(u_data);
    }
    return res.json({
      status: true,
      message: "Data",
      result: list,
      page_length: Math.ceil(count / limit),
      total: count,
    });
  }
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

router.post("/get_grp_wise_leads", async (req, res) => {
  let grp_id = req.body.grp_id ? req.body.grp_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  if (grp_id == "")
    return res.json({ status: false, message: "Please provide grp id" });
  let grp_data = await LeadGroup.findOne({ _id: grp_id, is_delete: "0" });
  let leads_count = await LeadGroupItem.find({ grp_id: grp_data._id })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  console.log("leads_count", leads_count);
  let arr = [];
  for (let i = 0; i < leads_count.length; i++) {
    let lead_data = await Lead.findOne({
      _id: leads_count[i].lead_id,
      is_delete: "0",
    });
    if (lead_data) {
      let state_data = await Location.findOne({ id: lead_data.state });
      let emp_data = await Employee.findOne({ _id: lead_data.assignToEmp });
      let data = {
        lead_name: lead_data.leadName ? lead_data.leadName : "",
        _id: lead_data._id ? lead_data._id : "",
        mobile_no: lead_data.mobileNumber ? lead_data.mobileNumber : "",
        state: state_data ? state_data.name : "",
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
  let count = await LeadGroupItem.find({ grp_id: grp_data._id });
  let u_data = {
    lead_grp_name: grp_data.grp_name,
    id: grp_data._id,
    lead_arr: arr,
    lead_grp_color: grp_data.colour,
    leads: leads_count.length,
  };
  return res.json({
    status: true,
    message: "Data",
    result: u_data,
    count: count,
    page_length: Math.ceil(count.length / limit),
  });
});

router.post("/update_lead", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var leadName = req.body.leadName ? req.body.leadName : "";
  var displayName = req.body.displayName ? req.body.displayName : "";
  var mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : "";
  var email = req.body.email ? req.body.email : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var pincode = req.body.pincode ? req.body.pincode : "";
  var leadSource = req.body.leadSource ? req.body.leadSource : "";
  var addBy = req.body.addBy ? req.body.addBy : "";
  var note = req.body.note ? req.body.note : "";
  var assignToEmp = req.body.assignToEmp ? req.body.assignToEmp : "";
  var status = req.body.status ? req.body.status : "";
  var lead_id = req.body.lead_id ? req.body.lead_id : "";
  var deal_value = req.body.deal_value ? req.body.deal_value : "";
  var lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
  var customer_grp = req.body.customer_grp ? req.body.customer_grp : "";
  var lead_potential = req.body.lead_potential ? req.body.lead_potential : "";
  var currency = req.body.currency ? req.body.currency : "";
  console.log(req.body);
  // var is_customer     = (req.body.is_customer) ? req.body.is_customer : "";
  if (token != "") {
    if (lead_id != "") {
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
            var user_data = {};
            // user_data.admin_id              = user_id;
            user_data.Updated_date = get_current_date();
            if (deal_value != "") {
              user_data.deal_value = deal_value;
            }
            if (leadName != "") {
              user_data.leadName = leadName;
            }
            if (displayName != "") {
              user_data.displayName = displayName;
            }
            if (mobileNumber != "") {
              user_data.mobileNumber = mobileNumber;
            }
            if (email != "") {
              user_data.email = email;
            }
            if (pincode != "") {
              user_data.pincode = pincode;
            }
            if (state != "") {
              user_data.state = state;
            }
            if (city != "") {
              user_data.city = city;
            }
            if (leadSource != "") {
              user_data.leadSource = leadSource;
            }
            if (addBy != "") {
              user_data.addBy = addBy;
            }
            if (note != "") {
              user_data.note = note;
            }
            if (lead_stage != "") {
              user_data.lead_stage = lead_stage;
            }
            if (customer_grp != "") {
              user_data.customer_grp = customer_grp;
            }
            if (lead_potential != "") {
              user_data.lead_potential = lead_potential;
            }
            if (currency != "") {
              user_data.currency = currency;
            }
            if (assignToEmp != "") {
              user_data.assignToEmp = assignToEmp;
            }
            if (status != "") {
              user_data.status = status;
            }
            Lead.findOneAndUpdate(
              { _id: lead_id },
              user_data,
              { new: true },
              (err, doc) => {
                if (doc) {
                  res.status(200).json({
                    status: true,
                    message: "Update successfully",
                    results: doc,
                  });
                } else {
                  res.status(200).json({
                    status: true,
                    message: "Update error !",
                    results: null,
                  });
                }
              }
            );
          }
        });
    } else {
      return res.json({
        status: false,
        message: "lead_id require !",
        results: null,
      });
    }
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
});

router.delete("/delete_lead", protectTo, async (req, res) => {
  var user_id = req.loggedInUser.user_id;
  const { lead_id } = req.body;
  Admin.findById(user_id)
    .exec()
    .then(async (user_info) => {
      if (user_info.length < 1) {
        res.status(401).json({
          status: false,
          message: "User not found !",
          results: null,
        });
      } else {
        await LeadGroupItem.deleteMany({ lead_id });
        await Lead.updateOne({ _id: lead_id }, { $set: { is_delete: "1" } });
        return res.json({ status: true, message: "Deleted successfully" });
      }
    });
});

router.delete("/customers", protectTo, async (req, res) => {
  const user_id = req.loggedInUser.user_id;
  let { type = "", id = "" } = req.body;
  type = type.toUpperCase();
  const com_data = await Admin.findById(user_id);
  if (!com_data) {
    return errorHandler(res, 401, "User not found!");
  }
  if (type == "" || !["RETAILER", "PARTY"].includes(type)) {
    return errorHandler(res, 400, "Invalid customer type!");
  }
  if (id == "" || !mongoose.isValidObjectId(id)) {
    return errorHandler(res, 400, "Please provide valid id");
  }
  switch (type) {
    case "RETAILER":
      const retailer = await Retailer.findOneAndUpdate(
        { _id: id, company_id: com_data._id },
        { is_delete: "1" }
      );
      if (!retailer) {
        return errorHandler(res, 404, "User not found!");
      }
      break;
    case "PARTY":
      const party = await Party.findOneAndUpdate(
        { _id: id, company_id: com_data._id },
        { is_delete: "1" }
      );
      if (!party) {
        return errorHandler(res, 404, "User not found!");
      }
      await PartyGroup.findOneAndUpdate(
        { party_id: id, company_id: com_data._id },
        { is_delete: "1" }
      );
      break;
    default:
      return errorHandler(res, 400, "Please provide valid customer type!");
  }
  return res
    .status(200)
    .json({ status: true, message: "Delete Successfully!" });
});

router.delete("/delete_lead_grp", protectTo, async (req, res) => {
  const user_id = req.loggedInUser.user_id;
  Admin.findById(user_id)
    .exec()
    .then(async (user_info) => {
      if (user_info.length < 1) {
        res.status(401).json({
          status: false,
          message: "User not found !",
          results: null,
        });
      } else {
        await LeadGroup.updateOne(
          { _id: grp_id },
          { $set: { is_delete: "1" } }
        );
        return res.json({ status: true, message: "Deleted successfully" });
      }
    });
});

// router.delete('/delete_multiple_leads',async (req,res)=>{
//   let lead_id_arr = req.body.lead_id_arr?req.body.lead_id_arr:[];
//   if(lead_id_arr.length<1) return res.json({status:false,message:"PLease send atleast one lead id"})
//   try{
//     for(let i = 0;i<lead_id_arr.length;i++){
//       await LeadGroupItem.deleteMany({lead_id:lead_id_arr[i]});
//       await Lead.updateOne({_id:lead_id_arr[i]},{$set:{is_delete:"1"}});
//     }
//     return res.json({status:true,message:"Deleted successfully"})
//   }catch(err){
//     console.log("Error",err)
//   }
// })

router.delete("/delete_multiple_leads", async (req, res) => {
  const leadIdArr = req.body.leadIdArr || [];
  if (leadIdArr.length < 1) {
    return res.json({
      status: false,
      message: "Please send at least one lead id",
    });
  }

  try {
    const deletePromises = leadIdArr.map((leadId) => {
      const deleteItemsPromise = LeadGroupItem.deleteMany({ lead_id: leadId });
      const updateLeadPromise = Lead.updateOne(
        { _id: leadId },
        { $set: { is_delete: "1" } }
      );
      return Promise.all([deleteItemsPromise, updateLeadPromise]);
    });

    await Promise.all(deletePromises); // Instead of waiting for each database operation to complete before moving to the next one, you can use Promise.all() to run all the database operations in parallel. This will make the code faster, as it will take advantage of the parallelism of modern CPUs

    return res.json({ status: true, message: "Deleted successfully" });
  } catch (err) {
    console.log("Error", err);
    return res.json({ status: false, message: "Failed to delete leads" });
  }
});

// router.post('/manage_grp', async (req, res) => {
//   let token = (req.get('Authorization')) ? req.get('Authorization') : "";
//   if (token != "") {
//     const decoded = await getDecodedToken(token);
//     let user_id = decoded.user_id;
//     const leadIdArr = req.body.lead_id_arr || [];
//     if (leadIdArr.length < 1) return res.json({ status: false, message: "Please send at least one lead id" });
//     let key = req.body.key || "";
//     if (key == "") return res.json({ status: false, message: "Please specify your action key" });
//     if (key == "remove") {
//       try {
//         for (let i = 0; i < leadIdArr.length; i++) {
//           await LeadGroupItem.deleteMany({ lead_id: leadIdArr[i] });
//         }
//         return res.json({ status: true, message: "Deleted successfully" })
//       } catch (err) {
//         console.log("Error", err)
//       }
//     } else if (key == "change") {
//       let date = get_current_date().split(" ")[0]
//       let old_grp_id = req.body.old_grp_id || "";
//       let new_grp_id = req.body.new_grp_id || "";
//       for (let i = 0; i < leadIdArr.length; i++) {
//         await LeadGroupItem.deleteMany({ grp_id:old_grp_id,lead_id: leadIdArr[i] });
//       }
//       for (let i = 0; i < leadIdArr.length; i++) {
//         let new_lead_grp_item_data = await LeadGroupItem.create({
//           company_id: user_id,
//           grp_id: new_grp_id,
//           lead_id: leadIdArr[i],
//           date: date,
//           Created_date: get_current_date(),
//           Updated_date: get_current_date(),
//           status: "Active",
//         })
//       }
//       return res.json({ status: true, message: "Lead group changed successfully" })
//     } else {
//       return res.json({ status: false, message: "Unknown action key" })
//     }
//   }
//   else {
//     return res.json({ status: false, message: "Please provide token" })
//   }
// })

// router.post("/manage_grp", async (req, res) => {
//   const token = req.get("Authorization") || "";
//   if (!token) {
//     return res.json({ status: false, message: "Please provide token" });
//   }

//   try {
//     const decoded = await getDecodedToken(token);
//     const userId = decoded.user_id;

//     const {
//       lead_id_arr = [],
//       key = "",
//       old_grp_id = "",
//       new_grp_id = "",
//     } = req.body;
//     if (lead_id_arr.length < 1) {
//       return res.json({
//         status: false,
//         message: "Please send at least one lead id",
//       });
//     }
//     if (!["remove", "change"].includes(key)) {
//       return res.json({ status: false, message: "Unknown action key" });
//     }

//     const date = get_current_date().split(" ")[0];

//     switch (key) {
//       case "remove":
//         await Promise.all(
//           lead_id_arr.map((leadId) =>
//             LeadGroupItem.deleteMany({ grp_id: old_grp_id, lead_id: leadId })
//           )
//         );
//         return res.json({ status: true, message: "Deleted successfully" });

//       case "change":
//         await Promise.all(
//           lead_id_arr.map((leadId) =>
//             LeadGroupItem.deleteMany({ grp_id: old_grp_id, lead_id: leadId })
//           )
//         );
//         await Promise.all(
//           lead_id_arr.map((leadId) =>
//             LeadGroupItem.create({
//               company_id: userId,
//               grp_id: new_grp_id,
//               lead_id: leadId,
//               date: date,
//               Created_date: get_current_date(),
//               Updated_date: get_current_date(),
//               status: "Active",
//             })
//           )
//         );
//         return res.json({
//           status: true,
//           message: "Lead group changed successfully",
//         });

//       default:
//         return res.json({ status: false, message: "Unknown action key" });
//     }
//   } catch (err) {
//     console.log("Error", err);
//     return res.json({ status: false, message: "Something went wrong" });
//   }
// });

// router.post('/manage_grp_lead',async (req,res)=>{
//   const token = req.get('Authorization') || "";
//   if (!token) {
//     return res.json({ status: false, message: "Please provide token" });
//   }

//   try {
//     const decoded = await getDecodedToken(token);
//     const userId = decoded.user_id;

//     const { lead_id_arr = [], key = "", new_grp_id = "" } = req.body;
//     if (lead_id_arr.length < 1) {
//       return res.json({ status: false, message: "Please send at least one lead id" });
//     }
//     if (!["change"].includes(key)) {
//       return res.json({ status: false, message: "Unknown action key" });
//     }

//     const date = get_current_date().split(" ")[0];
//     for(let i = 0;i<lead_id_arr.length;i++){
//       let lead_data = await Lead.findOne({_id:lead_id_arr[i]})
//       await LeadGroupItem.deleteOne({grp_id:lead_data.customer_grp,lead_id:lead_id_arr[i]})
//       await Lead.findByIdAndUpdate({_id:lead_id_arr[i]},{$set:{customer_grp:new_grp_id}})
//       let new_lead_grp_item_data =await LeadGroupItem.create({
//         company_id: userId,
//         grp_id: new_grp_id,
//         lead_id: lead_id_arr[i],
//         date: date,
//         Created_date: get_current_date(),
//         Updated_date: get_current_date(),
//         status: "Active",
//       })
//     }
//     return res.json({Status:true,message:"Group changed successfully"})
//   }catch(err){
//     console.log("Error",err)
//   }
// })

// router.post('/manage_grp_lead', async (req, res) => {
//   try {
//     const token = req.get('Authorization') || "";
//     if (!token) {
//       return res.json({ status: false, message: "Please provide token" });
//     }
//     const decoded = await getDecodedToken(token);
//     const userId = decoded.user_id;

//     const { lead_id_arr = [], key = "", new_grp_id = "" } = req.body;
//     if (lead_id_arr.length < 1) {
//       return res.json({ status: false, message: "Please send at least one lead id" });
//     }
//     if (!["change"].includes(key)) {
//       return res.json({ status: false, message: "Unknown action key" });
//     }

//     const date = get_current_date().split(" ")[0];
//     const bulkOperations = lead_id_arr.map((leadId) => ({
//       deleteOne: { filter: { grp_id: lead_data.customer_grp, lead_id: leadId } },
//     }));
//     bulkOperations.push({
//       updateMany: {
//         filter: { _id: { $in: lead_id_arr } },
//         update: { $set: { customer_grp: new_grp_id } },
//       },
//     });
//     const newLeadGroupItems = lead_id_arr.map((leadId) => ({
//       company_id: userId,
//       grp_id: new_grp_id,
//       lead_id: leadId,
//       date,
//       Created_date: get_current_date(),
//       Updated_date: get_current_date(),
//       status: "Active",
//     }));
//     bulkOperations.push({ insertMany: { documents: newLeadGroupItems } });

//     await LeadGroupItem.bulkWrite(bulkOperations);
//     return res.json({ Status: true, message: "Group changed successfully" });
//   } catch (err) {
//     console.log("Error", err);
//     return res.json({ status: false, message: "Internal server error" });
//   }
// });

// router.post('/assign_to_team',async (req,res)=>{
//   let leadIdArr = req.body.leadIdArr || [];
//   let emp_id = req.body.leadIdArr || "";
//   if(leadIdArr.length<1) return res.json({status:false,message:"Please give atleast one lead"});
//   if(emp_id == "") return res.json({status:false,message:"Please give employee id"});
//   await Promise.all(
//     leadIdArr.map((leadId)=>{
//       Mapping.create({
//         primary_id:emp_id,
//         primary_type:"Employee",
//         assigned_to_id:leadId,
//         assigned_to_type:"Lead",
//         status:"Active",
//         Created_date:get_current_date(),
//         Updated_date:get_current_date(),
//       })
//   })
//   )
//   return res.json({status:true,message:"Assigned successfully"})
// })

router.post("/manage_grp_lead", async (req, res) => {
  try {
    const token = req.get("Authorization") || "";
    if (!token) {
      return res.json({ status: false, message: "Please provide token" });
    }
    const decoded = await getDecodedToken(token);
    const userId = decoded.user_id;

    const { lead_id_arr = [], key = "", new_grp_id = "" } = req.body;

    if (lead_id_arr.length < 1) {
      return errorHandler(res, 401, "Please send at least one lead id");
    }
    if (
      !lead_id_arr.every((id) => mongoose.isValidObjectId(id)) ||
      !mongoose.isValidObjectId(new_grp_id)
    ) {
      return errorHandler(res, 400, "Please provide valid group and lead");
    }
    if (!["change"].includes(key)) {
      return errorHandler(res, 400, "Unknown action key");
    }
    let isGroupExist = await LeadGroup.findById(new_grp_id);
    if (!isGroupExist) {
      return errorHandler(res, 404, "Group not exist");
    }

    const date = get_current_date().split(" ")[0];

    await Lead.updateMany(
      { _id: { $in: lead_id_arr } },
      { $set: { customer_grp: new_grp_id } }
    );

    const leadGroupItemsToDelete = await LeadGroupItem.find({
      lead_id: { $in: lead_id_arr },
    });
    const leadGroupItemsToInsert = lead_id_arr.map((leadId) => ({
      company_id: userId,
      grp_id: new_grp_id,
      lead_id: leadId,
      date,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: "Active",
    }));

    await Promise.all([
      LeadGroupItem.deleteMany({
        _id: { $in: leadGroupItemsToDelete.map(({ _id }) => _id) },
      }),
      LeadGroupItem.insertMany(leadGroupItemsToInsert),
    ]);

    return res.json({ Status: true, message: "Group changed successfully" });
  } catch (err) {
    console.log("Error", err);
    return res.json({ status: false, message: "Internal server error" });
  }
});

router.post("/assign_to_team", async (req, res) => {
  const { leadIdArr, emp_id } = req.body;

  if (!leadIdArr || leadIdArr.length < 1) {
    return res.json({
      status: false,
      message: "Please provide at least one lead",
    });
  }

  if (!emp_id) {
    return res.json({
      status: false,
      message: "Please provide an employee ID",
    });
  }

  const mappings = leadIdArr.map((leadId) => ({
    primary_id: emp_id,
    primary_type: "Employee",
    assigned_to_id: leadId,
    assigned_to_type: "Lead",
    status: "Active",
    Created_date: new Date(),
    Updated_date: new Date(),
  }));
  console.log("*************leadArray************", leadIdArr);
  await Promise.all(
    leadIdArr.map((leadId) =>
      Lead.findByIdAndUpdate(leadId._id, { assignToEmp: emp_id })
    )
  );

  try {
    const result = await Mapping.insertMany(mappings);
    return res.json({ status: true, message: "Assigned successfully" });
  } catch (error) {
    console.error(error);
    return res.json({
      status: false,
      message: "An error occurred while assigning leads",
    });
  }
});

router.post("/message", protectTo, async (req, res) => {
  try {
    let { title = "", body = "" } = req.body;
    title = title.trim();
    body = body.trim();
    const companyId = req.loggedInUser.user_id;
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
      company_id: companyId,
      status: "Active",
      feedBy: companyId,
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
    const id = req.body.id || "";
    if (id == "")
      return res.json({ status: false, message: "Please give message id" });
    /*The Object.assign() method creates a new object that has properties from the specified objects. In this case, we're creating a new object with the {} empty object as the first argument, followed by one or more objects that contain the updated properties.
The && operator is used to conditionally add properties to the updatedMessage object. If title is truthy (i.e., not null, undefined, 0, false, or ''), then the { title } object is added to updatedMessage. If body is truthy, then the { description: body } object is added to updatedMessage.
If both title and body are falsy, then the resulting updatedMessage object will be empty.*/

    const updatedMessage = Object.assign(
      {},
      title && { title: title.trim() },
      body && { description: body.trim() }
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
  const companyId = req.loggedInUser.user_id;
  const message_id = req.body.id || "";
  if (!message_id)
    return res.json({ status: false, message: "Please give message id" });
  let msg_data = await Message.findOne({
    _id: message_id,
    is_delete: "0",
    company_id: companyId,
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
  try {
    const companyId = req.loggedInUser.user_id;
    const { page = 1 } = req.query;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || (page - 1) * limit;

    const [message_data, total_message_count] = await Promise.all([
      Message.find({ company_id: companyId, is_delete: "0" })
        .limit(limit)
        .skip(skip)
        .sort({ _id: -1 }),
      Message.countDocuments({ company_id: companyId, is_delete: "0" }),
    ]);
    if (message_data.length === 0) {
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
  } catch (error) {
    return res.json({
      status: false,
      message: "NO data found!",
    });
  }
});

router.get("/message/:id", protectTo, async (req, res) => {
  try {
    const companyId = req.loggedInUser.user_id;
    const id = req.params.id;
    if (!id) {
      return res.json({
        status: false,
        message: "Please provide id",
      });
    }
    const message_data = await Message.findOne({
      _id: id,
      is_delete: "0",
      company_id: companyId,
    });
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
  } catch (error) {
    return res.json({
      status: false,
      message: "No data found!",
    });
  }
});

router.post("/share-message_whatsapp", async (req, res) => {
  const receiverData = req.body.receiverData;
  // const phoneNumbers = phone.map(p => `${p.replace(/\D/g,'')}`); // format phone numbers with country code
  // const url = `https://wa.me/${phoneNumbers.join(",")}?text=${encodeURIComponent(message)}`;
  const phoneNumbers = phone.join(",");
  console.log("phoneNumbers-----   ", typeof phoneNumbers);

  Promise.allSettled(
    receiverData.forEach((data) => {
      sendMessage(data.phoneNumbers, data.message);
    })
  );
  return res.json({
    status: true,
    message: "URL opened successfully",
  });
});

router.post("/share_message_whatsapp_twilio", (req, res) => {
  const accountSid = "ACc3f03d291aaa9b78b8088eb0b77bf616";
  const authToken = "92b01cca8b90ee27838ca245b24dc19f";
  const client = require("twilio")(accountSid, authToken);

  client.messages
    .create({
      from: "whatsapp:+14155238886",
      body: "Hello, there!",
      to: "whatsapp:8787058645",
    })
    .then((message) => console.log(message.sid));
  return res.json({ status: true, message: "Sent" });
});

sendMessage = function (phoneNumbers, message) {
  return new Promise((resolve, reject) => {
    message = message.split(" ").join("%20");
    const url = `https://api.whatsapp.com/send?phone='${number}'&text=%20'${message}`;
    // const url = `whatsapp://send?phone=${phoneNumbers}&text=${encodeURIComponent(message)}`;
    opn(url, (err) => {
      if (err) {
        reject("Error opening share URL");
      }
      resolve("URL opened successfully");
    });
  });
};

// FILE SUB-MODULE
const upload = multer({
  storage: multer.memoryStorage({}),
  fileFilter: (req, file, cb) => {
    if (req.body.fileType.toUpperCase() == "PDF") {
      if (!file?.originalname.match(/\.(pdf)$/)) {
        return cb("File format is unsupported, please upload pdf file!");
      }
      cb(null, true);
    } else if (
      !file?.originalname.toLowerCase().match(/\.(jpg|jpeg|png|pdf)$/)
    ) {
      console.log("file original name", file.originalname);
      return cb("File format is unsupported!");
    }
    cb(null, true);
  },
  limits: {
    fileSize: 52428800, //((100 * 1024) KB * 1024) MB
  },
}).fields([{ name: "pdf" }, { name: "file" }]);

const { MulterError } = require("multer");
const { error } = require("console");

const multerErrorWrapper = (upload) => (req, res, next) => {
  try {
    upload(req, res, (err) => {
      console.log("error in multer", err);
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
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
};

router.post(
  "/file",
  protectTo,
  fileExisted,
  multerErrorWrapper(upload),
  async (req, res) => {
    try {
      const feedById = req.loggedInUser.user_id;
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

      fileType = fileType.toUpperCase();
      console.log("fileType", fileType);
      const date = get_current_date().split(" ")[0];
      const isFileExisted = await File.findOne({
        title: new RegExp(title, "i"),
        fileType,
      });
      if (isFileExisted) {
        return errorHandler(res, 403, "File already exist with the title!");
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

      if (fileType == "CATALOGUE") {
        if (req.files.file) {
          const uniqueFile = [
            ...new Set(req.files.file.map((element) => element.originalname)),
          ];
          imageUrlData = Promise.all(
            uniqueFile.map((name) =>
              writeImagePromise(
                req.files.file.find((file) => file.originalname === name)
              )
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
        if (req.files.pdf) {
          const uniqueFile = [
            ...new Set(req.files.pdf.map((element) => element.originalname)),
          ];
          pdfUrlData = Promise.all(
            uniqueFile.map((name) =>
              writePdfPromise(
                req.files.pdf.find((pdf) => pdf.originalname === name)
              )
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
        const uniqueFile = [
          ...new Set(req.files.pdf.map((element) => element.originalname)),
        ];
        pdfUrlData = Promise.all(
          uniqueFile.map((name) =>
            writePdfPromise(
              req.files.pdf.find((pdf) => pdf.originalname === name)
            )
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

      const file_data = File.create({
        title: title.trim(),
        description: fileType == "PDF" ? null : description,
        images: imageUrlData,
        company_id: feedById,
        date,
        mediaUrl: mediaUrl || null,
        websiteUrl: websiteUrl || null,
        websiteName: websiteName || null,
        pdf: pdfUrlData,
        feedById,
        feedBy: "COMPANY",
        fileType: fileType,
        status: "Active",
      });

      return res.json({
        status: true,
        message: "File added successfully",
        data: await file_data,
      });
    } catch (error) {
      return res.json({
        status: false,
        message: error.message,
      });
    }
  }
);

function fileExisted(req, res, next) {
  try {
    fs.openSync("images/file", "r");
    next();
  } catch (error) {
    fs.mkdirSync(error.path);
    next();
  }
}

router.put(
  "/file",
  protectTo,
  fileExisted,
  multerErrorWrapper(upload),
  async (req, res) => {
    try {
      const feedById = req.loggedInUser.user_id;
      let imageUrlData = [];
      let pdfUrlData = [];
      let {
        fileId = "",
        title,
        fileType = "",
        status,
        description,
        mediaUrl,
        imageUrl = [],
        websiteUrl,
        websiteName,
      } = req.body;
      if (!fileId) {
        return res.json({ status: false, message: "Please provide the id" });
      }
      if (!fileType) {
        return res.json({
          status: false,
          message: "Please provide the file type",
        });
      }
      fileType = fileType.toUpperCase();
      let update_date = get_current_date();
      let updated_file = { feedById, update_date };

      console.log("********imageUrl**************", typeof imageUrl);
      if (imageUrl.length > 0) {
        imageUrl = JSON.parse(imageUrl);
        console.log("********imageUrl**************", typeof imageUrl);
        if (
          !imageUrl.every((url) =>
            url.startsWith("https://webservice.salesparrow.in/images/file/")
          )
        ) {
          return errorHandler(res, 400, "Invalid image url!");
        }
      }

      if (fileType == "CATALOGUE") {
        if (req.files.file?.length) {
          const uniqueFile = [
            ...new Set(req.files.file.map((element) => element.originalname)),
          ];
          imageUrlData = Promise.all(
            uniqueFile.map((name) =>
              writeImagePromise(
                req.files.file.find((file) => file.originalname === name)
              )
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
        if (req.files.pdf?.length) {
          const uniqueFile = [
            ...new Set(req.files.pdf.map((element) => element.originalname)),
          ];
          pdfUrlData = Promise.all(
            uniqueFile.map((name) =>
              writePdfPromise(
                req.files.pdf.find((pdf) => pdf.originalname === name)
              )
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      } else if (fileType == "PDF") {
        if (req.files.pdf?.length) {
          const uniqueFile = [
            ...new Set(req.files.pdf.map((element) => element.originalname)),
          ];
          pdfUrlData = Promise.all(
            uniqueFile.map((name) =>
              writePdfPromise(
                req.files.pdf.find((pdf) => pdf.originalname === name)
              )
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      }

      imageUrlData = (await imageUrlData) || null;
      pdfUrlData = (await pdfUrlData) || null;

      if (imageUrlData.length) {
        updated_file.images = imageUrl.concat(imageUrlData) || null;
      }
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

      console.log("************updated_file********", updated_file);
      const updated_data = await File.findByIdAndUpdate(fileId, updated_file, {
        new: true,
      });
      if (!updated_data) {
        return res.json({ status: false, message: "Data not found!" });
      }
      return res.json({
        status: true,
        message: "Updated successfully",
        data: await updated_data,
      });
    } catch (error) {
      return res.json({
        status: false,
        message: error.message,
      });
    }
  }
);

router.get("/file/:fileId/:userId?", async (req, res) => {
  try {
    const { fileId = "", userId = "" } = req.params;
    let fileData;
    if (fileId && !userId) {
      fileData = await File.findById(fileId);
      if (!fileData) {
        fileData = await LeadBanner.findById(fileId);
        if (!fileData) {
          return res.json({ status: false, message: "File not found!" });
        }
      }
      return res.json({
        status: true,
        data: fileData,
      });
    } else {
      if (!fileId || !userId) {
        return res.json({ status: false, message: "Invalid url!" });
      }
      const sharedData = await SharedMedia.findOne({
        media: fileId,
        sharedWith: userId,
      });
      if (!sharedData) {
        return res.json({
          status: false,
          message: "Media not found!",
        });
      }
      let userData = {};
      if (sharedData.userType.toUpperCase() == "LEAD") {
        userData = await Lead.findById({ _id: userId });
        if (!userData) {
          return res.json({ status: false, message: "User not found!" });
        }
      } else if (sharedData.userType.toUpperCase() == "PARTY") {
        userData = await Party.findById({ _id: userId });
        if (!userData) {
          return res.json({ status: false, message: "User not found!" });
        }
      } else if (sharedData.userType.toUpperCase() == "RETAILER") {
        userData = await Retailer.findById({ _id: userId });
        if (!userData) {
          return res.json({ status: false, message: "User not found!" });
        }
      } else {
        return res.json({
          status: false,
          message: "Invalid url!",
        });
      }
      fileData = await File.findById(fileId);
      if (!fileData) {
        return res.json({ status: false, message: "File not found!" });
      }
      await SharedMedia.findOneAndUpdate(
        { media: fileId, sharedWith: userId, userType: sharedData.userType },
        {
          opened: true,
          unopened: false,
          $inc: { openCount: 1 },
        }
      );
      console.log("inside view file function", req.params);
      return res.json({
        status: true,
        data: fileData,
      });
    }
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

router.get("/file", protectTo, async (req, res) => {
  try {
    console.log("body data", req.body);
    const companyId = req.loggedInUser.user_id;
    const {
      page = "1",
      status = "",
      fileType = "",
      fileId = "",
      limit = 10,
      skip = 0,
    } = req.body;
    let isFiltered = "DEFAULT";
    let filter = { company_id: companyId, is_delete: "0" };
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
      console.log("filter1", filter);
      let file_data = await File.findOne(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      console.log("filter1", file_data);
      if (!file_data) {
        return res.json({ status: false, message: "Data not found" });
      }
      return res.json({
        status: true,
        message: "Data",
        result: file_data,
      });
    } else {
      const [file_data, total_file_count] = await Promise.all([
        File.find(filter).limit(limit).skip(skip).sort({ created_date: -1 }),
        File.countDocuments(filter),
      ]);
      console.log("filter2", filter);
      if (!file_data.length) {
        return res.json({ status: false, message: "Data not found" });
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
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

// router.delete("/file/deleteMedia", protectTo, async (req, res) => {
//   // const { type = "", url = "" } = req.body;
//   const { type = "", url = "", id = "" } = req.body;
//   const urlCase = "https://webservice.salesparrow.in/images/File/";
//   const typeCase = ["images", "pdf"];
//   let condition = {};
//   console.log("helolo", type, url, id);
//   if (!type || !url || !id) {
//     return errorHandler(res, 400, "Please provide required data!");
//   }
//   if (!url || !url.match(urlCase)) {
//     return errorHandler(res, 400, "Please provide valid url!");
//   }
//   if (!typeCase.includes(type)) {
//     return errorHandler(res, 400, "Please provide valid type!");
//   }
//   if (type === "images") {
//     condition = { $pull: { images: url } };
//   } else if (type === "pdf") {
//     condition = { $pull: { pdf: url } };
//   }
//   const file = await File.findByIdAndUpdate(id, condition, { new: true });
//   console.log(file);
//   return res.json({
//     status: false,
//     message: "delete successfully!",
//   });
// });

router.delete("/file/:id", protectTo, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorHandler(res, 400, "Please provide the valid id!");
    }
    const companyId = req.loggedInUser.user_id;
    const findData = await File.findOne({
      _id: id,
      company_id: companyId,
      is_delete: "0",
    });
    console.log(findData);
    if (!findData) {
      return errorHandler(res, 404, "Data Not Found!");
    }
    await File.findByIdAndUpdate(
      { _id: id, company_id: companyId },
      { $set: { is_delete: "1", status: "InActive" } }
    );
    return res.json({ status: true, message: "Deleted successfully" });
  } catch (error) {
    return errorHandler(res, error.Status, error.message);
  }
});

const writePdfPromise = function (file) {
  let fileName =
    Date.now() +
    "_" +
    file.originalname.substr(0, 6).split(" ").join("_") +
    "." +
    file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
  return new Promise((resolve, reject) => {
    fs.writeFile(`images/file/${fileName}`, file.buffer, (err) => {
      if (err) reject(err);
      else {
        resolve(`${getBaseUrl()}images/file/${fileName}`);
      }
    });
  });
};

const writeImagePromise = function (file) {
  console.log(
    "*****************inside writeImagePromise*****************",
    file
  );
  let fileName =
    Date.now() +
    "_" +
    file.originalname.substr(0, 6).split(" ").join("_") +
    "." +
    file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
  return new Promise((resolve, reject) => {
    sharp(file.buffer)
      .resize(320, 240)
      .toFile(`images/file/${fileName}`, (err) => {
        if (err) reject(err);
        else {
          resolve(`${getBaseUrl()}images/file/${fileName}`);
        }
      });
  });
};

// async function protectTo(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     return res.json({
//       status: false,
//       message: "Token must be provided",
//     });
//   }
//   req.loggedInUser = await jwt.verify(token, "test");
//   next();
// }

// SHARE-MEDIA SUB-MODULE
router.post("/sharedMedia", protectTo, async (req, res) => {
  try {
    const company_id = req.loggedInUser.user_id;
    let com_data = await Admin.findOne({ _id: company_id, is_delete: "0" });
    if (!com_data) {
      return res.status(401).json({ status: false, message: "No user found!" });
    }
    let {
      sharedWith = "",
      userType = "",
      media = "",
      type = "FILE",
    } = req.body;
    if (!sharedWith || !userType || !media) {
      return res.json({
        status: false,
        message: `Please provide ${
          !sharedWith
            ? "user data whom to share"
            : !userType
            ? "type of user"
            : !type
            ? "type"
            : "media url"
        }`,
      });
    }
    if (!mongoose.isValidObjectId(media)) {
      return errorHandler(res, 400, "Provide valid media!");
    }
    userType = userType?.trim().toUpperCase();
    type = type?.trim().toUpperCase();
    if (userType == "LEAD") {
      userType = "Lead";
      let userData = await Lead.findOne({
        _id: sharedWith,
        company_id,
      });
      if (!userData) {
        return errorHandler(res, 404, "Lead not found!");
      }
    } else if (userType == "PARTY") {
      userType = "Party";
      let userData = await Party.findOne({
        _id: sharedWith,
        company_id,
      });
      if (!userData) {
        return errorHandler(res, 404, "Party not found!");
      }
    } else if (userType == "CUSTOMER") {
      userType = "Retailer";
      let userData = await Retailer.findOne({
        _id: sharedWith,
        company_id,
      });
      if (!userData) {
        return errorHandler(res, 404, "Customer not found!");
      }
    } else {
      return errorHandler(res, 400, "Please provide valid userType!");
    }
    const url = `https://crm.salesparrow.in/whatsapp-preview/${
      media + "/" + sharedWith
    }`;
    let file = await File.findById(media);
    if (!file) {
      file = await LeadBanner.findById(media);
      if (!file) {
        return errorHandler(res, 400, "File not found!");
      }
    }
    if (type === "FILE") {
      const updateShareCount = await File.findByIdAndUpdate(
        { _id: media },
        { $inc: { sharedCount: 1 } },
        { new: true }
      );
      console.log("updateShareCount", updateShareCount);
    }
    const sharedMedia = await SharedMedia.create({
      sharedBy: {
        _id: company_id,
        by: "COMPANY",
      },
      preview: ``,
      company_id,
      sharedWith,
      userType,
      media,
      type,
    });

    if (!sharedMedia) return errorHandler(res, 500, "Try again!");
    res.json({ status: true, url });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

router.get("/sharedHistory/:id", protectTo, async (req, res) => {
  try {
    const company_id = req.loggedInUser.user_id;

    const fileId = req.params.id;
    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(401).json({
        status: false,
        message: "Provide valid id!",
      });
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

// Activity SUB-MODULE
router.post("/activity", protectTo, async (req, res) => {
  try {
    const user_id = req.loggedInUser.user_id;
    let time = "";
    let { type = "", description = "", date = "", leadId = "" } = req.body;
    if (!leadId) {
      return res.status(401).json({
        status: false,
        message: "lead_id require !",
      });
    }
    if (!date || !type) {
      return res.status(401).json({
        status: false,
        message: "Please provide valid data",
      });
    }
    type = type.toUpperCase();
    if (!["PHONE", "NOTE", "MEETING", "MESSAGE"].includes(type)) {
      return errorHandler(res, 400, "Please provide valid type");
    }
    const admin = await Admin.findById({ _id: user_id });
    if (!admin) {
      return errorHandler(res, 401, "Not Authorized!");
    }
    date = get_date(new Date(date));
    const dateAndTime = date;
    time = date.split(" ")[1];
    date = date.split(" ")[0];
    const isExisted = await LeadFollowUp.findOne({
      company_id: user_id,
      type,
      date,
      time,
    });
    if (isExisted) {
      return errorHandler(res, 403, "FollowUp already exist!");
    }
    const lead_data = await Lead.findById({ _id: leadId });
    if (!lead_data) {
      return errorHandler(res, 404, "Lead not found!");
    }
    // console.log("adminData", admin);
    const followup = await LeadFollowUp.create({
      type,
      description,
      date,
      dateAndTime,
      time,
      lead: leadId,
      admin: lead_data.assignToEmp || user_id,
      company_id: admin._id,
    });

    console.log("create FollowUp", !followup);
    if (!followup) {
      return res.status(401).json({
        status: false,
        message: "Please try again!",
      });
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

router.put("/followUp", protectTo, async (req, res) => {
  try {
    const user_id = req.loggedInUser.user_id;
    let { date, leadId } = req.body;
    if (!leadId || !date || !mongoose.isValidObjectId(leadId)) {
      return res.status(401).json({
        status: false,
        message: "lead_id and date require !",
      });
    }
    const admin = await Admin.findById({ _id: user_id });
    if (!admin) {
      return errorHandler(res, 401, "Not Authorized!");
    }
    date = new Date(date);
    if (date == "Invalid Date") {
      date = new Date();
    }
    // const dateAndTime = date;
    // time = date.split(" ")[1];
    // date = date.split(" ")[0];

    const leadData = await Lead.findById(leadId);
    if (!leadData) {
      return errorHandler(res, 200, "Lead not found!");
    }
    const updateFollowup = await Lead.findByIdAndUpdate(
      leadId,
      { next_followup: date, last_followup: leadData.next_followup },
      { new: true }
    );
    if (!updateFollowup) {
      return errorHandler(res, 403, "FollowUp not updated!");
    }
    console.log("followUp", {
      after: {
        next_followup: updateFollowup.next_followup,
        last_followup: updateFollowup.last_followup,
      },
      before: {
        next_followup: leadData.next_followup,
        last_followup: leadData.last_followup,
      },
    });
    return res.status(201).json({
      status: true,
      message: "followUp updated successfully!",
      date: updateFollowup
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
      return res.status(400).json({
        status: false,
        message: "lead_id require !",
        results: null,
      });
    }
    const user_id = req.loggedInUser.user_id;
    const admin = await Admin.findOne({ _id: user_id });
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "User not found !",
      });
    }
    let condition = {};
    condition.is_delete = "0";
    condition.lead = leadId;
    const totalData = await LeadFollowUp.countDocuments(condition);
    console.log("totalData", totalData, condition);
    if (!totalData) {
      return res.status(404).json({
        status: false,
        message: "Data not found!",
      });
    }
    const lead_g_data = await LeadFollowUp.find(condition)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dateAndTime: -1 });

    return res.json({
      status: true,
      message: "Data Found",
      pageLength: Math.ceil(totalData / limit),
      count: totalData,
      data: lead_g_data,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

// router.put("/activity", protectTo, async (req, res) => {
//   try {
//     console.log("body", req.body);
//     let { type = "", description = "", date = "", id = "" } = req.body;

//     console.log("type description", type, description);
//     if (!id) {
//       return res.json({
//         status: false,
//         message: "followUp id require !",
//       });
//     }
//     var user_id = req.loggedInUser.user_id;
//     const admin = await Admin.findOne({ _id: user_id, is_deleted: "0" });
//     if (!admin) {
//       return res.status(401).json({
//         status: false,
//         message: "User not found !",
//       });
//     }
//     let updatingData = {};
//     updatingData.Updated_date = get_current_date();
//     if (type) {
//       type = type.toUpperCase();
//       if (!["PHONE", "NOTE", "MEETING", "MESSAGE"].includes(type)) {
//         return res.status(401).json({
//           status: false,
//           message: "Please provide valid type",
//         });
//       }
//       updatingData.type = type;
//     }
//     const isExist = await LeadFollowUp.findById(id);

//     if (!isExist) {
//       return errorHandler(res, 404, "No followup found");
//     }
//     if (description) {
//       updatingData.description = description.trim();
//     }

//     if (date) {
//       date = get_date(new Date(date));
//       updatingData.date = date.split(" ")[0].split("/").join("-");
//       if (date.split(" ")[1]) {
//         updatingData.time = date.split(" ")[1];
//       }
//     }
//     const newDate = updatingData.date + " " + updatingData.time;
//     console.log("*********date adn time*********", newDate);
//     updatingData.dateAndTime = new Date(newDate);

//     console.log("updatingData", updatingData);
//     const followUp = await LeadFollowUp.findByIdAndUpdate(
//       { _id: id },
//       updatingData,
//       { new: true }
//     );
//     console.log("updated followUp", followUp);
//     if (!followUp) {
//       return res.status(400).json({
//         status: true,
//         message: "Please provide valid id!",
//       });
//     }
//     return res.status(200).json({
//       status: true,
//       message: "Update successfully",
//       results: followUp,
//     });
//   } catch (error) {
//     return res.json({
//       status: false,
//       message: error.message,
//     });
//   }
// });

router.post("/listFollowUpLogs", protectTo, async (req, res) => {
  try {
    let { limit = 10, skip = 0, key = "ALL", filtered = "ALL" } = req.body;
    const company_id = req.loggedInUser.user_id;
    const currentDate = new Date(Date.now());
    const upcomingDate = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    console.log("date", currentDate, upcomingDate)
    let data = [];
    let count = 0;
    key = key?.trim().toUpperCase();
    switch (key) {
      case "LEADS":
        filtered = "LEADS";
        data = await Lead.find({ company_id, is_delete: "0" })
          .skip(skip)
          .limit(limit);
        break;
      case "OVERDUE":
        filtered = "OVERDUE";
        data = await Lead.find({
          company_id,
          next_followup: { $lt: currentDate },
        })
          .skip(skip)
          .limit(limit);
        break;
      case "TODAY":
        filtered = "TODAY";
        data = await Lead.find({
          company_id,
          next_followup: { $eq: currentDate },
        })
          .skip(skip)
          .limit(limit);
        break;
      case "UPCOMING":
        filtered = "UPCOMING";
        data = await Lead.find({
          company_id,
          next_followup: {
            $gt: currentDate,
            $lt: upcomingDate,
          },
        })
          .skip(skip)
          .limit(limit);
        break;
      case "ALL":
        data = await Lead.aggregate([
          {
            $match: { company_id },
          },
          // {
          //   $lookup: {
          //     from: "leads",
          //     localField: "lead",
          //     foreignField: "_id",
          //     as: "lead",
          //   },
          // },
          {
            $facet: {
              overdue: [
                {
                  $match: {
                    next_followup: { $lt: currentDate },
                  },
                },
                {
                  $count: "overdueCount",
                },
              ],
              upcoming: [
                {
                  $match: {
                    next_followup: {
                      $gt: currentDate,
                      $lt: upcomingDate,
                    },
                  },
                },
                {
                  $count: "upcomingCount",
                },
              ],
              today: [
                {
                  $match: {
                    next_followup: { $eq: currentDate },
                  },
                },
                {
                  $count: "todayCount",
                },
              ],
            },
          },
          {
            $project: {
              overdue: { $arrayElemAt: ["$overdue.overdueCount", 0] },
              upcoming: { $arrayElemAt: ["$upcoming.upcomingCount", 0] },
              today: { $arrayElemAt: ["$today.todayCount", 0] },
            },
          },
        ]);
        break;
      default:
        "Please provide valid key";
    }

    if (key === "ALL") {
      const { overdue = [], upcoming = [], today = [] } = data[0];
      return res.json({
        status: true,
        data: {
          overdue: overdue.length == 0 ? 0 : overdue,
          upcoming: upcoming.length == 0 ? 0 : upcoming,
          today: today.length == 0 ? 0 : today,
        },
      });
    } else if (!count) {
      return res.json({
        status: false,
        message: "Data not found!",
      });
    } else {
      count = data.length;
      return res.json({
        status: true,
        message: "Data Found",
        filtered,
        pageLength: Math.ceil(count / limit),
        count,
        data,
      });
    }
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

function get_date(today = new Date()) {
  if (today == "Invalid Date") {
    today = new Date();
  }
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const time =
    String(today.getHours()).padStart(2, "0") +
    ":" +
    String(today.getMinutes()).padStart(2, "0") +
    ":" +
    String(today.getSeconds()).padStart(2, "0");
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

module.exports = router;
