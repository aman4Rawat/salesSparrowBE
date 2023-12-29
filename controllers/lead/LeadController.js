const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const { extractCompanyId } = require("../../middleware/response");
// const { exec } = require("child_process");
const opn = require("opn");
// const axios = require("axios");
const Location = mongoose.model("Location");
const File = mongoose.model("File");
const Admin = mongoose.model("AdminInfo");
const Lead = mongoose.model("Lead");
const Banner = mongoose.model("Banner");
const Mapping = mongoose.model("Mapping");
const Route = mongoose.model("Route");
const LeadGroup = mongoose.model("LeadGroup");
const Message = mongoose.model("Message");
const Leadfollow = mongoose.model("leadfollow");
const LeadGroupItem = mongoose.model("LeadGroupItem");
const Role = mongoose.model("role");
const Party = mongoose.model("Party");
const base_url = "https://webservice.salesparrow.in/";
const Retailer = mongoose.model("Retailer");
const Beat = mongoose.model("Beat");
const jwt = require("jsonwebtoken");
const router = express.Router();

const multer = require("multer");
const fs = require("fs");
const path = require("path");

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

router.post("/lead_list", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var lead_id = req.body.lead_id ? req.body.lead_id : "";
  var search = req.body.search ? req.body.search : "";
  var state = req.body.state ? req.body.state : "";
  var leadSource = req.body.leadSource ? req.body.leadSource : "";
  var lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
  var lead_potential = req.body.lead_potential ? req.body.lead_potential : "";
  var customer_grp = req.body.customer_grp ? req.body.customer_grp : "";
  var employee_id = req.body.employee_id ? req.body.employee_id : "";
  var page = req.body.page != "" ? req.body.page : 1;
  var limit = req.body.limit != "" ? req.body.limit : 20;
  // var is_customer     = (req.body.is_customer != '') ? req.body.is_customer : "0";
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
                        _id: rowData.state,
                      });
                      var sate_name = state_data.name;
                    } else {
                      var sate_name = "";
                    }
                    if (rowData.city != "") {
                      var city_data = await Location.findOne({
                        _id: rowData.city,
                      });
                      var city_name = city_data.name;
                    } else {
                      var city_name = "";
                    }
                    if (rowData.assignToEmp != "") {
                      var emp_data = await Employee.findOne({
                        _id: rowData.assignToEmp,
                      });
                      var emp_name = emp_data.employeeName;
                    } else {
                      var emp_name = "";
                    }
                    var leadfollow_data = await Leadfollow.findOne({
                      lead_id: rowData._id,
                    });
                    var u_data = {
                      _id: rowData._id,
                      admin_id: rowData.admin_id,
                      leadName: rowData.leadName,
                      displayName: rowData.displayName,
                      mobileNumber: rowData.mobileNumber,
                      email: rowData.email,
                      pincode: rowData.pincode,
                      state: rowData.state,
                      last_follow_date: leadfollow_data
                        ? leadfollow_data.Created_date
                        : "",
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
  } else {
    return res.json({
      status: false,
      message: "token require !",
      results: null,
    });
  }
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
                user_data.file = base_url + req.files.file[0].path;
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
                (err, obj) => { }
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

router.post("/add_leadfollowup", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var lead_id = req.body.lead_id ? req.body.lead_id : "";
  var phone_call = req.body.phone_call ? req.body.phone_call : "";
  var message = req.body.message ? req.body.message : "";
  var meeting = req.body.meeting ? req.body.meeting : "";
  var note = req.body.note ? req.body.note : "";
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
            var user_data = new Leadfollow();
            user_data.admin_id = user_id;
            user_data.phone_call = phone_call;
            user_data.message = message;
            user_data.meeting = meeting;
            user_data.note = note;
            user_data.lead_id = lead_id;
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

router.post("/leadfollowup_list", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var search = req.body.search ? req.body.search : "";
  var lead_id = req.body.lead_id ? req.body.lead_id : "";
  var page = req.body.page != "" ? req.body.page : 1;
  var limit = req.body.limit != "" ? req.body.limit : 20;
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
            var list1 = [];
            var condition = {};
            condition.is_delete = "0";
            condition.lead_id = lead_id;
            if (search != "") {
              var regex = new RegExp(search, "i");
              condition.name = regex;
            }
            Leadfollow.find(condition)
              .limit(limit * 1)
              .skip((page - 1) * limit)
              .sort({ _id: -1 })
              .exec()
              .then(async (lead_g_data) => {
                if (lead_g_data.length > 0) {
                  let counInfo = 0;
                  for (let i = 0; i < lead_g_data.length; i++) {
                    await (async function (rowData) {
                      var u_data = {
                        _id: rowData._id,
                        admin_id: rowData.admin_id,
                        lead_id: rowData.lead_id,
                        phone_call: rowData.phone_call,
                        message: rowData.message,
                        meeting: rowData.meeting,
                        note: rowData.note,
                        Created_date: rowData.Created_date,
                        Updated_date: rowData.Updated_date,
                        is_delete: rowData.is_delete,
                        status: rowData.status,
                      };
                      list1.push(u_data);
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

router.post("/update_lead_followup", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  var phone_call = req.body.phone_call ? req.body.phone_call : "";
  var message = req.body.message ? req.body.message : "";
  var meeting = req.body.meeting ? req.body.meeting : "";
  var note = req.body.note ? req.body.note : "";
  var status = req.body.status ? req.body.status : "";
  var leadfollow_id = req.body.leadfollow_id ? req.body.leadfollow_id : "";
  var is_delete = req.body.is_delete ? req.body.is_delete : "";
  if (token != "") {
    if (leadfollow_id != "") {
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
            if (phone_call != "") {
              user_data.phone_call = phone_call;
            }
            if (message != "") {
              user_data.message = message;
            }
            if (meeting != "") {
              user_data.meeting = meeting;
            }
            if (note != "") {
              user_data.note = note;
            }
            if (status != "") {
              user_data.status = status;
            }
            if (is_delete != "") {
              user_data.is_delete = is_delete;
            }
            Leadfollow.findOneAndUpdate(
              { _id: leadfollow_id },
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
        message: "leadfollow_id require !",
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

router.post("/get_leads", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  let leadSource = req.body.leadSource ? req.body.leadSource : "";
  let type = req.body.type ? req.body.type : "";
  let page = req.body.page ? req.body.page : 1;
  let limit = req.body.limit ? req.body.limit : 20;
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
            if (user_id != "") {
              condition.company_id = user_id;
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
            var condition = {};
            condition.is_delete = "0";
            if (leadSource != "") {
              condition.leadSource = leadSource;
            }
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
            var condition = {};
            condition.is_delete = "0";
            if (leadSource != "") {
              condition.leadSource = leadSource;
            }
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
            var condition = {};
            condition.is_delete = "0";
            if (leadSource != "") {
              condition.leadSource = leadSource;
            }
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
        }
      });
  } else {
    res.json({ status: false, message: "Token required!" });
  }
});

router.post("/get_clients", async (req, res) => {
  let token = req.get("Authorization") ? req.get("Authorization") : "";
  let status = req.body.status ? req.body.status : "";
  let type = req.body.type ? req.body.type : "";
  let page = req.body.page ? req.body.page : 1;
  let limit = req.body.limit ? req.body.limit : 20;
  if (token != "") {
    const decoded = await getDecodedToken(token);
    let user_id = decoded.user_id;
    Admin.findById(user_id).exec().then(async (user_info) => {
      if (user_info.length < 1) {
        res.status(401).json({ status: false, message: "User not found !", results: null, });
      } else {
        if (type == "customers") {
          let sub_type = req.body.sub_type ? req.body.sub_type : "";
          if (sub_type == "retailers") {
            let employee_id = req.body.employee_id
              ? req.body.employee_id
              : "";
            let beat_id = req.body.beat_id ? req.body.beat_id : "";
            let condition = {};
            condition.company_id = user_id;
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
                        if (
                          beat_data[j].route[k] == retailer_data[i].route_id
                        ) {
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
                        if (
                          beat_data[j].route[k] == retailer_data[i].route_id
                        ) {
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
            let condition = {};
            condition.company_id = user_id;
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
          let lead_stage = req.body.lead_stage ? req.body.lead_stage : "";
          let lead_potential = req.body.lead_potential
            ? req.body.lead_potential
            : "";
          let leadSource = req.body.leadSource ? req.body.leadSource : "";
          let customer_grp = req.body.customer_grp
            ? req.body.customer_grp
            : "";
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
          // let count = total_lead_data.length;
          if (lead_data.length < 1)
            return res.status(200).json({
              status: true,
              message: "Not Available !",
              result: list1,
            });
          let list = [];
          for (let i = 0; i < lead_data.length; i++) {

            let state_data = await Location.findOne({ id: lead_data[i].state });
            let emp_data = await Employee.findById(lead_data[i].assignToEmp)
            let lead_grp_data = await LeadGroup.findById(lead_data[i].customer_grp);
            var leadfollow_data = await Leadfollow.findById(lead_data[i]._id);
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
              last_follow_date: leadfollow_data
                ? leadfollow_data.Created_date
                : "NA",
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
            page_length: Math.ceil(lead_data.length / limit),
            total: lead_data.length,
          });
        } else if (type == "groups") {
          let list = [];
          let date = get_current_date().split(" ")[0];
          let new_lead_data = await Lead.find({
            company_id: user_id,
            is_delete: "0",
            date: date,
          });
          let new_leads = new_lead_data.length;
          let grp_data = await LeadGroup.find({
            company_id: user_id,
            is_delete: "0",
          })
            .limit(limit * 1)
            .skip((page - 1) * limit);
          let total_grp_data = await LeadGroup.find({
            company_id: user_id,
            is_delete: "0",
          });
          let count = total_grp_data.length;
          for (let i = 0; i < grp_data.length; i++) {
            let leads_count = await LeadGroupItem.find({
              grp_id: grp_data[i]._id,
            });
            let u_data = {
              lead_grp_name: grp_data[i].grp_name,
              id: grp_data[i]._id,
              // lead_arr:leads_count?leads_count:[],
              lead_grp_color: grp_data[i].colour,
              leads: leads_count.length,
            };
            list.push(u_data);
          }
          // list.push({new_leads:new_leads})
          return res.json({
            status: true,
            message: "Data",
            result: list,
            new_leads: new_leads,
            page_length: Math.ceil(count / limit),
            total: count,
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
      }
    });
  } else {
    res.json({ status: false, message: "Token required!" });
  }
});

router.post("/add_lead_banner", imageUpload.fields([{ name: "file" }]), async (req, res) => {
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
            user_data.file = base_url + req.files.file[0].path;
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

router.delete("/delete_lead", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  let lead_id = req.body.lead_id ? req.body.lead_id : "";
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
        await LeadGroupItem.deleteMany({ lead_id });
        await Lead.updateOne({ _id: lead_id }, { $set: { is_delete: "1" } });
        return res.json({ status: true, message: "Deleted successfully" });
      }
    });
});

router.delete("/delete_lead_grp", async (req, res) => {
  var token = req.get("Authorization") ? req.get("Authorization") : "";
  let grp_id = req.body.grp_id ? req.body.grp_id : "";
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

router.post("/manage_grp", async (req, res) => {
  const token = req.get("Authorization") || "";
  if (!token) {
    return res.json({ status: false, message: "Please provide token" });
  }

  try {
    const decoded = await getDecodedToken(token);
    const userId = decoded.user_id;

    const {
      lead_id_arr = [],
      key = "",
      old_grp_id = "",
      new_grp_id = "",
    } = req.body;
    if (lead_id_arr.length < 1) {
      return res.json({
        status: false,
        message: "Please send at least one lead id",
      });
    }
    if (!["remove", "change"].includes(key)) {
      return res.json({ status: false, message: "Unknown action key" });
    }

    const date = get_current_date().split(" ")[0];

    switch (key) {
      case "remove":
        await Promise.all(
          lead_id_arr.map((leadId) =>
            LeadGroupItem.deleteMany({ grp_id: old_grp_id, lead_id: leadId })
          )
        );
        return res.json({ status: true, message: "Deleted successfully" });

      case "change":
        await Promise.all(
          lead_id_arr.map((leadId) =>
            LeadGroupItem.deleteMany({ grp_id: old_grp_id, lead_id: leadId })
          )
        );
        await Promise.all(
          lead_id_arr.map((leadId) =>
            LeadGroupItem.create({
              company_id: userId,
              grp_id: new_grp_id,
              lead_id: leadId,
              date: date,
              Created_date: get_current_date(),
              Updated_date: get_current_date(),
              status: "Active",
            })
          )
        );
        return res.json({
          status: true,
          message: "Lead group changed successfully",
        });

      default:
        return res.json({ status: false, message: "Unknown action key" });
    }
  } catch (err) {
    console.log("Error", err);
    return res.json({ status: false, message: "Something went wrong" });
  }
});

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
      return res.json({
        status: false,
        message: "Please send at least one lead id",
      });
    }
    if (!["change"].includes(key)) {
      return res.json({ status: false, message: "Unknown action key" });
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

// MESSAGE SUB-MODULE
// router.post('/add_message',async (req,res)=>{
//   const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) {
//         return res.json({
//         status: false,
//         message: "Token must be provided",
//         });
//     }
//     var decodedToken = jwt.verify(token, "test");
//     var company_id = decodedToken.user_id;
//     let title = req.body.title?req.body.title:"";
//     let body = req.body.body?req.body.body:"";
//     let date = get_current_date().split(" ")[0]
//     if(body || title == "") return res.json({status:false,message:"Please give proper data"});
//     let new_message = Message.create({
//       title,
//       description:body,
//       company_id,
//       status:"Active",
//       date,
//     })
//     return res.json({status:true,message:"Message added successfully",data:new_message})
// })

router.post("/message", protectTo, async (req, res) => {
  try {
    let { title = "", body = "" } = req.body;
    title = title.trim();
    body = body.trim();
    const decodedToken = jwt.verify(req.token, "test");
    console.log("decodedToken", decodedToken);
    const companyId = decodedToken.user_id;
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

// router.post('/edit_message',async (req,res)=>{
//   const { title = "" , body = ""} = req.body;
//   let updated_message = {};
//   if(title != ""){
//     updated_message.title = title;
//   }
//   if(body != ""){
//     updated_message.description = body;
//   }
//   await Message.findByIdAndUpdate({_id:id},updated_message,{new:true});
//   return res.json({status:true,message:"Updated successfully"})
// })

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
  const decodedToken = jwt.verify(req.token, "test");
  const companyId = decodedToken.user_id;
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

// router.post('/message_listing',async (req,res)=>{
//   const authHeader = req.headers["authorization"]?.split(" ")[1];
//     if (!token) {
//       return res.json({
//         status: false,
//         message: "Token must be provided",
//       });
//     }
//     const decodedToken = jwt.verify(token, "test");
//     const companyId = decodedToken.user_id;
//     const { page = "" } = req.body;
//     const limit = 10;
//     const message_data = await Message.find({company_id:companyId}).limit(limit*1).skip((page-1)*limit)
//     const total_message_data = await Message.find({company_id:companyId})
//     if(message_data.length>0) return res.json({status:true,mmessage:"No data"});
//     return res.json({status:true,message:"Data",result:message_data,count:total_message_data.length,page_length:Math.ceil(total_message_data.length/limit)})
// })

router.get("/messages", protectTo, async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.token, "test");
    const companyId = decodedToken.user_id;
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
    const decodedToken = jwt.verify(req.token, "test");
    const companyId = decodedToken.user_id;
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

// const shareMessage = async (message, phone) => {
//   const shareUrl = `whatsapp://send?text=${encodeURIComponent(message)}&phone=${phone}`;

//   try {
//     await axios.post("/api/share-message", { shareUrl });
//     console.log("Message shared successfully!");
//   } catch (error) {
//     console.error("Error sharing message:", error.message);
//   }
// };

// // Call the function with the message and phone number you want to share with
// const message = "Hello, this is a message to share on WhatsApp.";
// const phone = "8787058645"; // Replace with the phone number you want to share with, including the country code.

// shareMessage(message, phone);

// router.post('/share-message_whatsapp', (req, res) => {
//   const { shareUrl } = req.body;
//   exec(`open "${shareUrl}"`, (error) => {
//     if (error) {
//       console.error("Error opening share URL:", error.message);
//       return res.status(500).json({ message: "Error sharing message" });
//     }
//     return res.status(200).json({ message: "Message shared successfully" });
//   });
// });

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

  // const url = `whatsapp://send?phone=${phoneNumbers}&text=${encodeURIComponent(message)}`;
  // opn(url, (err) => {
  //   if (err) {
  //     console.error(err);
  //     return res.json({
  //       status: false,
  //       message: "Error opening share URL",
  //     });
  //   }
  //   return res.json({
  //     status: true,
  //     message: "URL opened successfully",
  //   });
  // });
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
    console.log('file filter', file)
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
    fileSize: 20971520, //((20 * 1024) KB * 1024) MB
  },
}).fields([
  { name: "pdf", maxCount: 2 },
  { name: "file", maxCount: 6 },
]);

const contentFileHandler = async function (req, res, action) {
  upload(req, res, async function (error) {
    let { title = "", fileType = "", description = "" } = req.body;
    console.log(title, fileType)
    if (title == "" || fileType == "") {
      return res.json({
        status: false,
        message: "Please provide the required data",
      });
    }
    console.log("req.files", req.files);

    if (error) {
      if (error instanceof multer.MulterError) {
        if (error.code == "LIMIT_UNEXPECTED_FILE" || "LIMIT_FILE_COUNT") {
          return res.json({
            status: false,
            message: "File uploading limit exceeded!",
          });
        }
        if (error.code == "LIMIT_FILE_SIZE") {
          return res.json({
            status: false,
            message: "Maximum 10MB file is allowed!",
          });
        }
      } else if (error) {
        return res.json({
          status: false,
          message: error,
        });
      }
    }

    const decodedToken = jwt.verify(req.token, "test");
    const feedById = decodedToken.user_id;
    let imageUrlData = [];
    let pdfUrlData = [];

    if (action == "CREATE") {
      const date = get_current_date().split(" ")[0];
      if (req.body?.fileType.toUpperCase() == "CATALOGUE") {
        // const path = "./images/files/";

        if (req.files.file) {
          imageUrlData = Promise.all(
            req.files.file.map((file) =>
              writeFilePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
        if (req.files.pdf) {
          pdfUrlData = Promise.all(
            req.files.pdf.map((file) =>
              writeFilePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      } else if (req.body?.fileType.toUpperCase() == "PDF") {
        if (!req.files.pdf) {
          return res.json({
            status: true,
            message: "Please provide pdf"
          });
        }
        pdfUrlData = Promise.all(
          req.files.pdf.map((file) =>
            writeFilePromise(file)
              .then((path) => path)
              .catch((err) => err)
          )
        );
      }
      imageUrlData = (await imageUrlData) || null;
      pdfUrlData = (await pdfUrlData) || null;
      const file_data = File.create({
        title: title.trim(),
        description: description.trim(),
        images: imageUrlData,
        company_id: feedById,
        date,
        pdf: pdfUrlData,
        feedById,
        feedBy: "COMPANY",
        fileType: fileType.toUpperCase(),
        status: "Active",
      });
      return res.json({
        status: true,
        message: "File added successfully",
        data: await file_data,
      });
    } else if (action == "UPDATE") {
      console.log("req.files.file", req.files.file?.length);
      console.log("req.files.pdf", req.files.pdf?.length);
      const { id, title, fileType, status, body, description } = req.body;
      if (!id) {
        return res.json({ status: false, message: "Please provide the id" });
      }
      let update_date = get_current_date();
      let updated_file = { feedById, update_date };

      const date = get_current_date().split(" ")[0];
      if (req.body?.fileType.toUpperCase() == "CATALOGUE") {
        if (req.files.file?.length) {
          imageUrlData = Promise.all(
            req.files.file.map((file) =>
              writeFilePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
        if (req.files.pdf?.length) {
          pdfUrlData = Promise.all(
            req.files.pdf.map((file) =>
              writeFilePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      } else if (req.body?.fileType.toUpperCase() == "PDF") {
        if (req.files.pdf?.length) {
          pdfUrlData = Promise.all(
            req.files.pdf.map((file) =>
              writeFilePromise(file)
                .then((path) => path)
                .catch((err) => err)
            )
          );
        }
      }
      imageUrlData = (await imageUrlData) || null;
      pdfUrlData = (await pdfUrlData) || null;
      if (imageUrlData.length) {
        updated_file.images = imageUrlData || null;
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
      if (fileType) {
        updated_file.fileType = fileType;
      }
      if (status) {
        updated_file.status = status;
      }
      if (body) {
        updated_file.body = body;
      }
      const updated_data = await File.findOneAndUpdate(
        { _id: id },
        updated_file,
        {
          new: true,
        }
      );
      if (!updated_data) {
        return res.json({ status: false, message: "Data not found!" });
      }
      return res.json({
        status: true,
        message: "Updated successfully",
        data: await updated_data,
      });
    }
  });
};

router.post("/file", protectTo, (req, res) => {
  contentFileHandler(req, res, "CREATE");
});

router.put("/file", protectTo, async (req, res) => {
  try {
    contentFileHandler(req, res, "UPDATE");
  } catch (err) {
    console.log("error---", err);
  }
});

router.get("/file", protectTo, async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.token, "test");
    console.log("decodedToken", decodedToken, req.body);
    const companyId = decodedToken.user_id;
    const page = req.body.page ? req.body.page : "1";
    const status = req.body.status ? req.body.status : "";
    const fileType = req.body.fileType ? req.body.fileType : "";
    const fileId = req.body.fileId ? req.body.fileId : "";
    let isFiltered = "DEFAULT";
    let filter = { company_id: companyId };
    const limit = req.limit || 10;
    const skip = req.skip || 0;
    if (status) {
      filter.status = status;
      isFiltered = "COMPANY_ID";
    }
    if (fileType) {
      filter.fileType = fileType;
      isFiltered = "FILE_TYPE";
    }
    if (fileId) {
      filter._id = fileId;
      console.log("filter1", filter);
      let file_data = await File.find(filter)
        .limit(limit * 1)
        .skip((page - 1) * limit);
      return res.json({
        status: true,
        message: "Data",
        result: file_data,
      });
    } else {
      const [file_data, total_file_count] = await Promise.all([
        File.find({ company_id: companyId, is_delete: "0" })
          .limit(limit)
          .skip(skip)
          .sort({ _id: -1 }),
        File.countDocuments({ company_id: companyId, is_delete: "0" }),
      ]);
      console.log("filter2", filter);
      return res.json({
        status: true,
        message: "Data",
        result: file_data,
        pageLength: Math.ceil(total_file_count / limit),
        count: total_file_count,
      });
    }
  } catch (err) {
    console.log("error---", err);
  }
});

router.delete("/file/:id", protectTo, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    if (!id)
      return res.json({
        status: false,
        message: "Please provide the valid id",
      });
    const decodedToken = jwt.verify(req.token, "test");
    const companyId = decodedToken.user_id;
    const findData = await File.find({
      _id: id,
      company_id: companyId,
      is_delete: "0",
    });
    console.log(findData);
    if (!findData.length)
      return res.json({ status: false, message: "Data Not Found" });
    await File.findByIdAndUpdate(
      { _id: id, company_id: companyId },
      { $set: { is_delete: "1", status: "InActive" } }
    );
    return res.json({ status: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("error----", err);
  }
});

const writeFilePromise = function (file) {
  let fileName =
    Date.now() +
    "_" +
    file.originalname.substr(0, 6).split(" ").join("_") +
    "." +
    file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
  return new Promise((resolve, reject) => {
    fs.writeFile(`./images/files/${fileName}`, file.buffer, (err) => {
      if (err) reject(err);
      else {
        resolve(`${base_url}images/files/${fileName}`);
      }
    });
  });
};

// const imageStorage2 = multer.diskStorage({
//   destination: "images/file",
//   filename: (req, file, cb) => {
//     console.log("imageStorage2", imageStorage2)
//     cb(null, file.fieldname + '_' + Date.now()
//       + path.extname(file.originalname))
//   }
// });

// const imageUpload2 = multer({
//   storage: imageStorage2,
//   limits: {
//     fileSize: 100000000
//   },
//   fileFilter(req, file, cb) {
//     console.log("imageUpload2")
//     if (!file.originalname.match(/\.(png|jpg|pdf)$/)) {
//       return cb(new Error('Please upload a Image'))
//     }
//     cb(undefined, true)
//   }
// }).single('file')

// router.post('/file', async (req, res) => {
//   try {
//     // const string = JSON.stringify(req.headers["content-type"])
//     // console.log(string[string.match('boundary')])
//     imageUpload2(req, res, async (err) => {
//       if (err) {
//         console.error(err);
//         return res.status(400).json({ message: err.message });
//       }
//       const imageUrl = req.file ? `${req.file.filename}` : null;
//       const { title = "", fileType = "" } = req.body;
//       const companyId = req.company_id;
//       const date = get_current_date().split(" ")[0];
//       if (title == "" || fileType == "") return res.json({ status: false, message: "Please provide the required data" })
//       const new_file = await File.create({
//         title,
//         image: base_url + imageUrl,
//         companyId,
//         date,
//         fileType,
//         status: "Active"
//       });
//       console.log("file", req.file)
//       return res.json({ status: true, message: "File added successfully", result: new_file })
//     })
//   } catch (err) {
//     console.log("error--", err)
//   }
// })

// Import required packages and modules
// const express = require('express');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');
// const { promisify } = require('util');
// const fs = require('fs');
// const { sequelize, File } = require('../../models/fileModel');

// // Create the Express app
// const app = express();

// // Define the multer storage and upload objects
// const imageStorage3 = multer.diskStorage({
//   destination: path.join(__dirname, 'public', 'images', 'files'),
//   filename: (req, file, cb) => {
//     const extension = path.extname(file.originalname);
//     const timestamp = new Date().getTime();
//     cb(null, `${file.fieldname}_${timestamp}${extension}`);
//   },
// });
// const imageUpload3= multer({
//   storage: imageStorage3,
//   limits: { fileSize: 100000000 },
//   fileFilter: (req, file, cb) => {
//     const extension = path.extname(file.originalname).toLowerCase();
//     if (!['.jpg', '.jpeg', '.png'].includes(extension)) {
//       return cb(new Error('Please upload an image file'));
//     }
//     cb(null, true);
//   },
// }).single('file');

// // Define a middleware to validate the JWT token
// // const authenticateUser = async (req, res, next) => {
// //   try {
// //     const authHeader = req.headers.authorization;
// //     if (!authHeader) {
// //       return res.status(401).json({ message: 'Authorization header missing' });
// //     }
// //     const [, token] = authHeader.split(' ');
// //     if (!token) {
// //       return res.status(401).json({ message: 'Token missing' });
// //     }
// //     const decodedToken = await promisify(jwt.verify)(token, 'secret');
// //     req.userId = decodedToken.user_id;
// //     next();
// //   } catch (err) {
// //     console.error(err);
// //     res.status(401).json({ message: 'Invalid token' });
// //   }
// // };

// // Define the file upload route
// app.post('/files', (req, res) => {
//   imageUpload3(req, res, async (err) => {
//     if (err) {
//       console.error(err);
//       return res.status(400).json({ message: err.message });
//     }
//     const { title, body } = req.body;
//     if (!title || !body) {
//       return res.status(400).json({ message: 'Title and body are required' });
//     }
//     const imageUrl = req.file ? `/images/files/${req.file.filename}` : null;
//     try {
//       const newFile = await sequelize.transaction(async (t) => {
//         const file = await File.create(
//           {
//             title,
//             body,
//             imageUrl,
//             user_id: req.userId,
//             status: 'Active',
//           },
//           { transaction: t }
//         );
//         return file.toJSON();
//       });
//       return res.status(201).json({ message: 'File uploaded successfully', data: newFile });
//     } catch (err) {
//       console.error(err);
//       if (imageUrl) {
//         await promisify(fs.unlink)(path.join(__dirname, 'public', imageUrl));
//       }
//       return res.status(500).json({ message: 'Internal transaction4 error' });
//     }
//   });
// });

// // Start the server
// app.listen(3000, () => console.log('Server started on http://localhost:3000'));

router.post("/shareFile", async (req, res) => {
  const { phone, id, body } = req.body;
  const fileData = await File.findOne({ _id: id });
  let message = `${fileData.title},${fileData.title},${body}`;
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


// BANNER SUB-MODULE
const imageStorage3 = multer.diskStorage({
  destination: "images/banner",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const imageUpload3 = multer({
  storage: imageStorage3,
  limits: {
    fileSize: 100000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
}).single("banner");

router.post("/banner", protectTo, async (req, res) => {
  try {
    imageUpload3(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res.status(400).json({ message: err.message });
      }
      const decodedToken = jwt.verify(req.token, "test");
      const companyId = decodedToken.user_id;
      const imageUrl = req.file ? `${req.file.filename}` : null;
      let { title = "", bannerType = "" } = req.body;
      const date = get_current_date().split(" ")[0];
      bannerType = ["PERSONAL", "FESTIVAL", "PROMOTIONAL"]
        .filter((type) => bannerType.trim().toUpperCase() === type)
        .toString();
      console.log(bannerType);
      if (title == "" || bannerType == "")
        return res.json({
          status: false,
          message: "Please provide the required data",
        });
      const new_banner = await Banner.create({
        title,
        poster: base_url + imageUrl,
        companyId,
        date,
        bannerType,
        status: "Active",
      });
      return res.json({
        status: true,
        message: "Banner added successfully",
        result: new_banner,
      });
    });
  } catch (err) {
    console.log("error--", err);
  }
});

router.put("/banner", protectTo, async (req, res) => {
  try {
    imageUpload3(req, res, async (err) => {
      if (err) return res.status(400).json({ message: err.message });
      const imageUrl = req.file ? `${req.file.filename}` : null;
      const { id, title, bannerType, status } = req.body;
      if (!id)
        return res.json({ status: false, message: "Please provide the id" });
      let update_banner = {};
      if (imageUrl) update_banner.image = base_url + imageUrl;
      if (title) update_banner.title = title;
      if (bannerType) update_banner.bannerType = bannerType;
      if (status) update_banner.status = status;
      const banner = await Banner.findOneAndUpdate({ _id: id }, update_banner, {
        new: true,
      });
      if (!banner) res.json({ status: false, message: "Data not found!" });
      return res.json({
        status: true,
        message: "Updated successfully",
        data: banner,
      });
    });
  } catch (err) {
    console.log("error---", err);
  }
});

router.delete("/banner/:id", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id)
      return res.json({ status: false, message: "Please provide the id" });
    await Banner.findByIdAndUpdate({ _id: id }, { $set: { is_delete: "1" } });
    return res.json({ status: true, message: "Deleted successfully" });
  } catch (err) {
    console.log("error----", err);
  }
});

router.get("/banner", protectTo, async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.token, "test");
    const companyId = decodedToken.user_id;
    const page = req.body.page ? req.body.page : "1";
    const status = req.body.status ? req.body.status : "";
    const bannerType = req.body.bannerType ? req.body.bannerType : "";
    const bannerId = req.body.bannerId ? req.body.bannerId : "";
    let filter = { companyId };
    const limit = 10;
    if (status) filter.status = status;
    if (bannerType) {
      if (typeof bannerType == "object") {
        filter.bannerType = {};
        filter.bannerType.$in = [];
        bannerType.forEach((type) =>
          filter.bannerType.$in.push(type.toUpperCase())
        );
      } else filter.bannerType = bannerType;
    }
    if (bannerId) {
      let banner_data = await Banner.findOne({ _id: bannerId });
      return res.json({ status: true, message: "Data", result: banner_data });
    }
    console.log("filter", filter, bannerType, typeof bannerType);
    let banner_data = await Banner.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    let total_banner_data = await Banner.countDocuments(filter);
    return res.json({
      status: true,
      message: "Data",
      result: banner_data,
      pageLength: Math.ceil(total_banner_data / limit),
      count: total_banner_data,
    });
  } catch (err) {
    console.log("error---", err);
  }
});

router.post("/shareBanner", async (req, res) => {
  const { phone, id, body } = req.body;
  const bannnerData = await Banner.findOne({ _id: id });
  let message = `Image-${bannnerData.poster},Title-${bannnerData.title},Message-${body}`;
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


// SHARE-MEDIA SUB-MODULE
// const SharedMedia = mongoose.model("SharedMedia");

// router.post("/sharedMedia", protectTo, async (req, res) => {
//   const companyId = await jwt.verify(req.token, "test").user_id;
//   console.log(companyId, req.body);
//   const { sharedWith = [], userType = "", media = "" } = req.body;
//   if (!sharedWith.length)
//     res.json({
//       status: false,
//       message: "Please provide user data whom to share",
//     });
//   if (!userType)
//     res.json({ status: false, message: "Please provide user type" });
//   const sharedMedia = await SharedMedia.create({
//     sharedBy: companyId,
//     sharedWith,
//     userType,
//     media,
//   });
//   if (!sharedMedia) res.json({ status: false, message: "Try again!" });
//   res.json({ status: true, message: "Data is sucessfully created!" });
// });

// router.get("/listMedia", async (req, res) => {
//   const data = await SharedMedia.find({})
//     .populate("sharedWith")
//     .populate("media");
//   return res.json({ status: true, data });
// });

function protectTo(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  req.token = token;
  next();
}

module.exports = router;  
