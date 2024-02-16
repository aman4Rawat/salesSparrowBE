const express = require("express");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const PartyType = mongoose.model("PartyType");
const Mapping = mongoose.model("Mapping");
const { validateEmail, validateMobile } = require("../../helper/helper");
const Party = mongoose.model("Party");
const Check = mongoose.model("Check");
const Admin = mongoose.model("AdminInfo");
const Beat = mongoose.model("Beat");
const Route = mongoose.model("Route");
const Retailer = mongoose.model("Retailer");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const sid = "ACc3f03d291aaa9b78b8088eb0b77bf616";
const auth_token = "dcd61bc9945d61c11b67612fdef40534";
const twilio = require("twilio")(sid, auth_token);
const jwt = require("jsonwebtoken");
const axios = require("axios");

const imageStorage = multer.diskStorage({
  destination: "images/Employee_image",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
});
const imageStorage2 = multer.diskStorage({
  destination: "images/documents",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload2 = multer({
  storage: imageStorage2,
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

router.post(
  "/addEmployee",
  imageUpload.fields([{ name: "Employee_image" }]),
  async (req, res) => {
    // console.log(req.body);
    var employeeName = req.body.employeeName ? req.body.employeeName : "";
    var companyShortCode = req.body.companyShortCode
      ? req.body.companyShortCode
      : "";
    var phone = req.body.phone ? req.body.phone : "";
    var state = req.body.state ? req.body.state : "";
    var email = req.body.email ? req.body.email : "";
    if (email != "") {
      if (!validateEmail(email))
        return res.json({
          status: false,
          message: "Please provide a valid email",
        });
      let existing_employee_data = await Employee.find({ email });
      let existing_admin_data = await Admin.find({ email });
      let existing_party_data = await Party.find({ email });
      if (existing_employee_data.length > 0) {
        return res.json({ status: false, message: "Email already exists" });
      }
      if (existing_admin_data.length > 0) {
        return res.json({ status: false, message: "Email already exists" });
      }
      if (existing_party_data.length > 0) {
        return res.json({ status: false, message: "Email already exists" });
      }
    }
    var headquarterState = req.body.headquarterState
      ? req.body.headquarterState
      : "";
    var headquarterCity = req.body.headquarterCity
      ? req.body.headquarterCity
      : "";
    var city = req.body.city ? req.body.city : "";
    var pincode = req.body.pincode ? req.body.pincode : "";
    // var district = req.body.district ? req.body.district : "";
    let new_companyShortCode = companyShortCode.slice(0, 8);
    if (employeeName != "") {
      if (phone != "") {
        if (!validateMobile(phone))
          return res.json({
            status: false,
            message: "Please provide a valid mobile number",
          });
        if (companyShortCode != "") {
          Admin.findOne({ companyShortCode: new_companyShortCode })
            .exec()
            .then(async (admin_info) => {
              if (admin_info) {
                let company = await Admin.findOne({
                  companyShortCode: new_companyShortCode,
                });
                var emp_data = await Employee.findOne({
                  companyId: company._id,
                }).sort({ employee_code: -1 });
                if (emp_data) {
                  var employee_code = emp_data.employee_code + 1;
                } else {
                  var employee_code = 1;
                }
                var existing_employee_data = await Employee.find({
                  phone: phone,
                });
                var existing_admin_data = await Admin.find({ phone: phone });
                var existing_retailer_data = await Retailer.find({
                  mobileNo: phone,
                });
                var existing_party_data = await Party.find({ mobileNo: phone });
                if (existing_employee_data.length > 0) {
                  return res.json({
                    status: false,
                    message: "Phone number already exists",
                  });
                }
                if (existing_admin_data.length > 0) {
                  return res.json({
                    status: false,
                    message: "Phone number already exists",
                  });
                }
                if (existing_retailer_data.length > 0) {
                  return res.json({
                    status: false,
                    message: "Phone number already exists",
                  });
                }
                if (existing_party_data.length > 0) {
                  return res.json({
                    status: false,
                    message: "Phone number already exists",
                  });
                }
                var new_employee = new Employee({
                  employeeName: employeeName,
                  phone: phone,
                  city: city,
                  company_code: admin_info.companyShortCode + "E",
                  employee_code: employee_code,
                  email: email,
                  headquarterState: headquarterState,
                  headquarterCity: headquarterCity,
                  companyId: admin_info._id,
                  country: company.country,
                  image: base_url + req.files.Employee_image[0].path,
                  state: state,
                  // district: district,
                  pincode: pincode,
                  Created_date: get_current_date(),
                  Updated_date: get_current_date(),
                  status: "UnApproved",
                });
                new_employee.save().then((data) => {
                  return res.status(200).json({
                    status: true,
                    message: "New Employee is created successfully",
                    results: data,
                  });
                });
              } else {
                return res.json({
                  status: false,
                  message: "Company short code is wrong",
                });
              }
            });
        } else {
          return res.json({
            status: false,
            message: "companyShortCode is required",
            results: null,
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Phone is required",
          results: null,
        });
      }
    } else {
      return res.json({
        status: false,
        message: "EmployeeName is required",
        results: null,
      });
    }
  }
);

// router.post("/sendOtp", (req, res) => {
//   console.log(req.body);
//   var to_phone_number = req.body.to_phone_number
//     ? req.body.to_phone_number
//     : "";
//   if (to_phone_number != "") {
//     Employee.findOne({ phone: to_phone_number }).exec().then((data) => {
//       if(data){
//         if (data.status == "InActive" || data.status == "UnApproved") {
//           return res.json({
//             status: false,
//             message: `You are ${data.status}. Please contact company.`,
//           });
//         }
//         //var OTP = Math.floor(1000 + Math.random() * 9000);
//         var OTP = "1234";
//         // const token = jwt.sign(
//         //   { user_id: data._id, is_token_valid: 1 },
//         //   "test"
//         // );
//         if (data.status=="Active" || data.status=="Approved") {
//               Employee.findOneAndUpdate(
//                 { phone: to_phone_number },
//                 { $set: { otp: OTP } }
//               ).exec().then(() => {
//                   res.json({
//                     status: true,
//                     message: "Message has been sent",
//                   });
//                 });

//             // .catch((err) => {
//             //   console.log(`err--------${err.message}-------thats all`);
//             //   if(err.message.includes("unverified")){
//             //     console.log("inside if")
//             //     Employee.findOneAndUpdate(
//             //       { phone: to_phone_number },
//             //       { $set: { otp: OTP } }
//             //     )
//             //       .exec()
//             //       .then(() => {
//             //        return res.json({
//             //           status: true,
//             //           message: "Message has been sent",
//             //         });
//             //       });
//             //   }else{
//             //     console.log("inside else")
//             //     res.json({
//             //       status: false,
//             //       message: "There is some error.",
//             //     });
//             //   }
//             //   });

//         } else {
//           res.json({
//             status: false,
//             message: "Not registered yet.please contact your admin.",
//           });
//         }
//       }else{
//         res.json({
//           status: true,
//           message: "Employee not found",
//         });
//       }
//       });
//   } else {
//     res.json({
//       status: false,
//       message: "Phone number is required",
//     });
//   }
// });

router.post("/sendOtp", async (req, res) => {
  var to_phone_number = req.body.to_phone_number
    ? req.body.to_phone_number
    : "";
  // let otp = Math.floor(1000 + Math.random() * 9000);
  let otp = "1234";
  Employee.findOne({ phone: to_phone_number })
    .exec()
    .then((emp_data) => {
      if (!emp_data)
        return res.json({
          status: true,
          message: "Please sign up first",
          type: "Register",
        });
      Employee.findOneAndUpdate(
        { phone: to_phone_number },
        { $set: { otp: otp } },
        { new: true },
        async () => {
          let res1 = await axios.get(
            `https://2factor.in/API/V1/f77ba5e8-641e-11ed-9c12-0200cd936042/SMS/${to_phone_number}/${otp}`
          );
          if (res1.data.Status == "Success") {
            return res.json({
              status: true,
              message: res1.data.Status,
              type: "Login",
            });
          }
        }
      );
    });
});

router.post("/emplogin", (req, res) => {
  // console.log(req.body);
  var phone = req.body.phone ? req.body.phone : "";
  var otp = req.body.otp ? req.body.otp : "";
  if (otp == "") return res.json({ status: false, message: "Otp is required" });
  var device_id = req.body.device_id ? req.body.device_id : "";
  var deviceToken = req.body.deviceToken ? req.body.deviceToken : "";
  if (device_id == "")
    return res.json({ status: false, message: "device_id is required" });
  if (deviceToken == "")
    return res.json({ status: false, message: "deviceToken is required" });
  if (phone != "") {
    Employee.findOne({ $and: [{ otp }, { phone }] })
      .exec()
      .then(async (emp_data) => {
        if (emp_data) {
          if (
            emp_data.status == "InActive" ||
            emp_data.status == "UnApproved"
          ) {
            return res.json({
              status: false,
              message: `You are ${emp_data.status}. Please contact company.`,
              token: "",
            });
          }
          // if (emp_data.is_login == true ) {
          //   console.log('you are login already')
          //   return res.json({
          //     status: false,
          //     message: `You are already logged in someother device`,
          //     token:''
          //   });
          // }
          if (emp_data.device_id == device_id) {
            await Employee.findOneAndUpdate(
              { _id: emp_data._id },
              { $set: { deviceToken, is_login: true } }
            );
            const token = jwt.sign(
              { user_id: emp_data._id, is_token_valid: 1 },
              "test"
            );
            return res.json({
              status: true,
              message: "Login Successful",
              result: emp_data,
              token: token,
            });
          } else if (
            emp_data.device_id != undefined &&
            emp_data.device_id != "" &&
            emp_data.device_id != device_id
          ) {
            return res.json({
              status: false,
              message: "Please login with your device",
              result: {},
              token: "",
            });
          } else if (emp_data.device_id == undefined) {
            let data = await Employee.find({ device_id });
            if (data.length > 0)
              return res.json({
                status: false,
                message: "Device is assigned to someone else",
              });
            await Employee.findOneAndUpdate(
              { _id: emp_data._id },
              { $set: { device_id, deviceToken, is_login: true } }
            );
            const token = jwt.sign(
              { user_id: emp_data._id, is_token_valid: 1 },
              "test"
            );
            return res.json({
              status: true,
              message: "Login Successful",
              result: emp_data,
              token: token,
            });
          } else if (emp_data.device_id == "") {
            let data = await Employee.findOne({ device_id });
            if (data)
              return res.json({
                status: false,
                message: `Device is assigned to ${data.employeeName} `,
              });
            await Employee.findOneAndUpdate(
              { _id: emp_data._id },
              { $set: { device_id, deviceToken, is_login: true } }
            );
            const token = jwt.sign(
              { user_id: emp_data._id, is_token_valid: 1 },
              "test"
            );
            return res.json({
              status: true,
              message: "Login Successful",
              result: emp_data,
              token: token,
            });
          }
        } else {
          res.json({
            status: false,
            message: "Please fill the valid otp or phone",
          });
        }
      });
  } else {
    res.json({
      status: false,
      message: "OTP is required",
    });
  }
});

router.post("/employee_logout", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token is required",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  try {
    await Employee.findByIdAndUpdate(
      { _id: employee_id },
      { $set: { is_login: false } }
    );
  } catch (err) {
    console.log("error--", err);
    res.json({ status: false, message: "There is some error in logging out" });
  }
  return res.json({ status: true, message: "Successfully logged out" });
});

router.post("/get_company_data", async (req, res) => {
  let company_code = req.body.company_code ? req.body.company_code : "";
  if (company_code == "")
    return res.json({ status: false, message: "Please give company code" });
  let a = company_code.slice(0, 8);
  let b = parseInt(company_code.slice(8));
  if (isNaN(b))
    return res.json({
      status: false,
      message: "Please check the company code",
    });
  let company_data = await Admin.findOne({
    companyShortCode: a,
    companyShortCode2: b,
  });
  if (!company_data)
    return res.json({
      status: false,
      message: "Please check the company code",
      result: [],
    });
  return res.json({ status: true, message: "Data", result: company_data });
});

router.get("/get_companies_country", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Token is required",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  let company_data = await Admin.findOne({ _id: emp_data.companyId });
  let country = company_data.country ? company_data.country : "";
  return res.json({ status: true, message: "Data", result: country });
});

router.get("/getEmployee", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token is required",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0];
  Employee.findOne({ _id: employee_id })
    .exec()
    .then((employee_data) => {
      if (
        employee_data.status == "Approved" ||
        employee_data.status == "Active"
      ) {
        Location.findOne({ id: employee_data.state })
          .exec()
          .then((state_data) => {
            Location.findOne({ id: employee_data.city })
              .exec()
              .then((city_data) => {
                // Location.findOne({ _id: employee_data.district })
                //   .exec()
                //   .then(async (area_data) => {
                Location.findOne({ id: employee_data.headquarterState })
                  .exec()
                  .then(async (headquarter_state_data) => {
                    Location.findOne({ id: employee_data.headquarterCity })
                      .exec()
                      .then(async (headquarter_city_data) => {
                        let check_in_data = await Check.findOne({
                          emp_id: employee_id,
                          check_in_date: date,
                        });
                        let companyData = await Admin.findById(
                          employee_data.companyId
                        );
                        Location.findOne({ id: companyData.state })
                          .exec()
                          .then(async (admin_state) => {
                            Location.findOne({
                              id: companyData.city,
                            })
                              .exec()
                              .then(async (admin_city) => {
                                var u_data = {
                                  employeeName: employee_data.employeeName,
                                  employee_id: employee_data._id,
                                  companyId: employee_data.companyId,
                                  phone: employee_data.phone,
                                  email: employee_data.email,
                                  address: employee_data.address,
                                  team_view: employee_data.team_view ?? true,
                                  gps_alarm: employee_data.gps_alarm ?? true,
                                  track_user: employee_data.track_user ?? true,
                                  employee_unique_id: `${employee_data.company_code}${employee_data.employee_code}`,
                                  headquarterState:
                                    headquarter_state_data.headquarterState,
                                  headquarterCity:
                                    headquarter_city_data.headquarterCity,
                                  pincode: employee_data.pincode,
                                  state: state_data.name,
                                  country: employee_data.country,
                                  image: employee_data.image,
                                  city: city_data.name,
                                  // district: area_data.name,
                                  experience: employee_data.experience,
                                  qualification: employee_data.qualification,
                                  userExpenses: employee_data.userExpenses
                                    ? employee_data.userExpenses
                                    : null,
                                  transportWays: employee_data.transportWays
                                    ? employee_data.transportWays
                                    : null,
                                  status: employee_data.status,
                                  check_in_time: check_in_data
                                    ? check_in_data.check_in_time
                                    : "NA",
                                  attendance_feature:
                                    companyData.attendance_feature,
                                  location_tracking_feature:
                                    companyData.location_tracking_feature,
                                  company_name: companyData.company_name,
                                  company_email: companyData.email,
                                  company_phone_number: companyData.phone,
                                  company_website: "www.crm.salesparrow.in",
                                  company_location: `${admin_city.name}, ${admin_state.name}`,
                                };
                                res.json({
                                  status: true,
                                  message: "Employee found successfully",
                                  result: u_data,
                                });
                              });
                          });
                      });
                  });
                // });
              });
          });
      } else {
        res.json({
          status: true,
          message: "Your profile is not approved yet",
          result: [],
        });
      }
    });
});

// router.post("/profile_update", (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     res.json({
//       status: false,
//       message: "Token is required",
//     });
//   }
//   let x = token.split(".")
//   if(x.length<3){
//     return res.send({status:false,message:"Invalid token"})
//   }
//   var decodedToken = jwt.verify(token, "test");
//   var employee_id = decodedToken.user_id;
//   Employee.findOne({ _id: employee_id })
//     .exec()
//     .then((emp_data) => {
//       if (emp_data.status == "Active" || emp_data.status == "Approved") {
//         var updated_emp = {};
//         if (req.body.phone) {
//           if(!validateMobile(req.body.phone)) return res.json({status:false,message:"Please provide a valid number"})
//           updated_emp.phone = req.body.phone;
//         }
//         if (req.body.email) {
//           if(!validateEmail(req.body.email)) return res.json({status:false,mesaage:"Please provide a valid email"})
//           updated_emp.email = req.body.email;
//         }
//         if (req.body.qualification) {
//           updated_emp.qualification = req.body.qualification;
//         }
//         // if (req.body.deviceId) {
//         //   updated_emp.deviceToken = req.body.deviceToken;
//         // }
//         if (req.body.experience) {
//           updated_emp.experience = req.body.experience;
//         }
//         if (req.body.address) {
//           updated_emp.address = req.body.address;
//         }
//         if (req.body.state) {
//           updated_emp.state = req.body.state;
//         }
//         if (req.body.city) {
//           updated_emp.city = req.body.city;
//         }
//         // if (req.body.district) {
//         //   updated_emp.district = req.body.district;
//         // }
//         if (req.body.pincode) {
//           updated_emp.pincode = req.body.pincode;
//         }
//         if (req.body.image) {
//           updated_emp.image = req.body.image;
//         }
//         Employee.findOneAndUpdate(
//           { _id: employee_id },
//           updated_emp,
//           { new: true },
//           (err, doc) => {
//             if (doc) {
//               res.json({
//                 status: true,
//                 message: "Updated successfully",
//                 result: updated_emp,
//               });
//             }
//           }
//         );
//       } else {
//         res.json({
//           status: false,
//           message: "You are inactive.",
//         });
//       }
//     });
// });

router.post(
  "/profile_update",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.json({ status: false, message: "Token is required" });
    const x = token.split(".");
    if (x.length < 3)
      return res.json({ status: false, message: "Invalid token" });
    const decodedToken = jwt.verify(token, "test");
    const employee_id = decodedToken.user_id;
    const emp_data = await Employee.findOne({ _id: employee_id }).exec();
    if (!["Active", "Approved"].includes(emp_data.status))
      return res.json({ status: false, message: "You are inactive." });

    const updated_emp = {};
    const updateFields = [
      "phone",
      "email",
      "qualification",
      "experience",
      "address",
      "state",
      "city",
      "pincode",
      "image",
    ];

    updateFields.forEach((field) => {
      if (req.body[field]) {
        if (field === "phone" && !validateMobile(req.body[field])) {
          return res.json({
            status: false,
            message: "Please provide a valid number",
          });
        }
        if (field === "email" && !validateEmail(req.body[field])) {
          return res.json({
            status: false,
            message: "Please provide a valid email",
          });
        }
        updated_emp[field] = req.body[field];
      }
    });

    const doc = await Employee.findOneAndUpdate(
      { _id: employee_id },
      updated_emp,
      { new: true }
    ).exec();

    if (doc)
      return res.json({
        status: true,
        message: "Updated successfully",
        result: updated_emp,
      });
  })
);

router.post(
  "/employeeProfileImage",
  imageUpload.fields([{ name: "Employee_image" }]),
  (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      res.json({
        status: false,
        message: "Token is required",
      });
    }
    let x = token.split(".");
    if (x.length < 3) {
      return res.send({ status: false, message: "Invalid token" });
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    Employee.findOne({ _id: employee_id })
      .exec()
      .then((user_data) => {
        if (user_data) {
          updated_employee = {};
          if (req.files.Employee_image) {
            updated_employee.image =
              base_url + req.files.Employee_image[0].path;
          }
          Employee.findOneAndUpdate(
            { _id: employee_id },
            updated_employee,
            { new: true },
            (err, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Updated Successfully",
                  result: updated_employee,
                });
              } else {
                res.json({
                  status: false,
                  message: "Error",
                  result: err,
                });
              }
            }
          );
        } else {
          res.json({
            status: false,
            message: "Id must be correct.",
          });
        }
      });
  }
);

router.post(
  "/addPartyEmp",
  imageUpload2.array("documentFiles", 10),
  async (req, res) => {
    // console.log("addPartyEmp------------------------------->", req.body);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided",
      });
    }
    let x = token.split(".");
    if (x.length < 3) {
      return res.send({ status: false, message: "Invalid token" });
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    var partyType = req.body.partyType ? req.body.partyType : "";
    var firmName = req.body.firmName ? req.body.firmName : "";
    var GSTNo = req.body.GSTNo ? req.body.GSTNo : "";
    var contactPersonName = req.body.contactPersonName
      ? req.body.contactPersonName
      : "";
    var mobileNo = req.body.mobileNo ? req.body.mobileNo : "";
    var email = req.body.email ? req.body.email : "";
    if (email != "") {
      if (!validateEmail(email))
        return res.json({
          status: false,
          message: "Please provide a valid email",
        });
    }
    var pincode = req.body.pincode ? req.body.pincode : "";
    var state = req.body.state ? req.body.state : "";
    var city = req.body.city ? req.body.city : "";
    // var district = req.body.district ? req.body.district : "";
    var address1 = req.body.address1 ? req.body.address1 : "";
    var address2 = req.body.address2 ? req.body.address2 : "";
    var documentNames = req.body.documentNames ? req.body.documentNames : "[]";
    documentNames = JSON.parse(documentNames);
    var DOB = req.body.DOB ? req.body.DOB : "";
    var DOA = req.body.DOA ? req.body.DOA : "";
    var route = req.body.route ? req.body.route : "";
    const files = req.files;
    if (partyType != "") {
      if (firmName != "") {
        if (mobileNo != "") {
          if (pincode != "") {
            if (city != "") {
              if (state != "") {
                // if (district != "") {
                if (address1 != "") {
                  if (email != "") {
                    var existing_employee_data = await Employee.find({
                      $or: [{ phone: mobileNo }, { email }],
                    });
                    var existing_admin_data = await Admin.find({
                      $or: [{ phone: mobileNo }, { email }],
                    });
                    var existing_retailer_data = await Retailer.find({
                      mobileNo: mobileNo,
                    });
                    var existing_party_data = await Party.find({
                      $or: [{ mobileNo: mobileNo }, { email }],
                    });
                  } else {
                    var existing_employee_data = await Employee.find({
                      $or: [{ phone: mobileNo }],
                    });
                    var existing_admin_data = await Admin.find({
                      $or: [{ phone: mobileNo }],
                    });
                    var existing_retailer_data = await Retailer.find({
                      mobileNo: mobileNo,
                    });
                    var existing_party_data = await Party.find({
                      $or: [{ mobileNo: mobileNo }],
                    });
                  }
                  if (existing_employee_data.length > 0) {
                    return res.json({
                      status: false,
                      message: "Phone number already exists",
                    });
                  }
                  if (existing_admin_data.length > 0) {
                    return res.json({
                      status: false,
                      message: "Phone number already exists",
                    });
                  }
                  if (existing_retailer_data.length > 0) {
                    return res.json({
                      status: false,
                      message: "Phone number already exists",
                    });
                  }
                  if (existing_party_data.length > 0) {
                    return res.json({
                      status: false,
                      message: "Phone number already exists",
                    });
                  }
                  Employee.findOne({ _id: employee_id })
                    .exec()
                    .then(async (emp_data) => {
                      const documents = [];
                      for (let i = 0; i < files.length; i++) {
                        documents.push({
                          name: documentNames[i] || "Not Specified",
                          value: base_url + files[i].path,
                        });
                      }
                      let company = await Admin.findOne({
                        _id: emp_data.companyId,
                      });
                      var party_data = await Party.findOne({
                        company_id: company._id,
                      }).sort({ party_code: -1 });
                      let party_code;
                      if (party_data) {
                        party_code = party_data.party_code + 1;
                      } else {
                        party_code = 1;
                      }
                      let x = route.split(",");
                      for (let i = 0; i < x.length; i++) {
                        await Route.findByIdAndUpdate(
                          { _id: x[i] },
                          { $set: { is_mapped: true } },
                          { new: true }
                        );
                      }
                      var new_party = new Party({
                        partyType: partyType,
                        firmName: firmName,
                        GSTNo: GSTNo,
                        contactPersonName: contactPersonName,
                        company_code: company.companyShortCode,
                        party_code: party_code,
                        mobileNo: mobileNo,
                        document: documents,
                        email: email,
                        company_id: emp_data.companyId,
                        employee_id: emp_data._id,
                        pincode: pincode,
                        state: state,
                        route: route,
                        city: city,
                        // district: district,
                        address1: address1,
                        address2: address2,
                        DOB: DOB,
                        DOA: DOA,
                        Created_date: get_current_date(),
                        Updated_date: get_current_date(),
                        status: "UnApproved",
                      });
                      new_party.save().then((data) => {
                        res.status(200).json({
                          status: true,
                          message: "Party created successfully",
                          result: data,
                        });
                      });
                    });
                } else {
                  res.json({
                    status: false,
                    message: "address is required",
                  });
                }
                // } else {
                //   res.json({
                //     status: false,
                //     message: "district is required",
                //   });
                // }
              } else {
                res.json({
                  status: false,
                  message: "state is required",
                });
              }
            } else {
              res.json({
                status: false,
                message: "City is required",
              });
            }
          } else {
            res.json({
              status: false,
              message: "pincode is required",
            });
          }
        } else {
          res.json({
            status: false,
            message: "Mobile Number is required",
          });
        }
      } else {
        res.json({
          status: false,
          message: "Firm Name is required",
        });
      }
    } else {
      res.json({
        status: false,
        message: "partyType is required",
      });
    }
  }
);

router.post("/getAllPartyEmp", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.json({ status: false, message: "Token must be provided" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  var page = req.body.page ? req.body.page : "1";
  var limit = 10;
  var count = await Party.find({ employee_id });
  var list = [];
  Mapping.find({
    primary_id: employee_id,
    primary_type: "Employee",
    assigned_to_type: "Party",
  })
    .sort({ status: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()
    .then(async (party_data) => {
      if (party_data.length > 0) {
        let counInfo = 0;
        for (let i = 0; i < party_data.length; i++) {
          let party = await Party.findOne({
            _id: party_data[i].assigned_to_id,
            is_delete: "0",
          });
          if (party) {
            let state_data = await Location.findOne({ id: party.state });
            let city_data = await Location.findOne({ id: party.city });
            let party_type_data = await PartyType.findOne({
              _id: party.partyType,
            });
            var u_data = {
              id: party._id,
              state: { name: state_data.name, id: party.state },
              city: { name: city_data.name, id: party.city },
              // district: {name: district_data.name,id: party.district,},
              firmName: party.firmName,
              party_unique_id: `${party.company_code}P${party.party_code}`,
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
            let c = Math.ceil(count.length / limit);
            if (c == 0) {
              c += 1;
            }
            return res.json({
              status: true,
              message: "All Parties found successfully",
              result: list,
              pageLength: c,
            });
          }
        }
      } else {
        return res.json({
          status: true,
          message: "No party found",
          result: [],
        });
      }
    });
});

router.post("/authorizedParty", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  beat_id = req.body.beat_id ? req.body.beat_id : "";
  if (beat_id == "") {
    return res.send({
      status: false,
      message: "First select beat",
      result: [],
    });
  }
  Employee.findOne({ _id: employee_id })
    .exec()
    .then((emp_data) => {
      Beat.findOne({ _id: beat_id })
        .exec()
        .then((beat_data) => {
          let final_arr = [];
          if (!beat_data)
            return res.send({
              status: true,
              message: "No Beat found",
              result: [],
            });
          Party.find({ company_id: emp_data.companyId, is_delete: "0" })
            .exec()
            .then(async (party_data) => {
              let company_data = await Admin.findOne({
                _id: emp_data.companyId,
              });
              if (party_data.length < 1)
                return res.send({
                  status: true,
                  message: "No party found",
                  result: company_data.company_name,
                });
              let count = 0;
              let route_arr = beat_data.route;
              for (let x = 0; x < route_arr.length; x++) {
                for (let i = 0; i < party_data.length; i++) {
                  if (party_data[i].route == null) {
                    continue;
                  } else {
                    var arr = party_data[i].route[0]
                      ? party_data[i].route[0].split(",")
                      : "";
                    if (arr == "") {
                      if (count == party_data.length - 1) {
                        res.json({
                          status: true,
                          message: "No party data found",
                          result: company_data.company_name,
                        });
                      }
                    } else {
                      for (let j = 0; j < arr.length; j++) {
                        if (arr[j] == route_arr[x]) {
                          final_arr.push(party_data[i]);
                        }
                      }
                    }
                  }
                }
                count++;
                if (final_arr == []) {
                  return res.json({
                    status: true,
                    message: "Authorized party not found",
                    result: company_data.company_name,
                  });
                } else {
                  return res.json({
                    status: true,
                    message: "Authorized parties found",
                    result: final_arr,
                  });
                }
              }
            });
        });
    });
});

router.post("/getParty", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  var list = [];
  if (id != "") {
    Party.findOne({ _id: id, is_delete: "0" })
      .exec()
      .then((party_data) => {
        if (party_data) {
          Location.findOne({ id: party_data.state })
            .exec()
            .then((state_data) => {
              Location.findOne({ id: party_data.city })
                .exec()
                .then((city_data) => {
                  // Location.findOne({ _id: party_data.district })
                  //   .exec()
                  //   .then((district_data) => {
                  PartyType.findOne({ _id: party_data.partyType })
                    .exec()
                    .then((party_type_data) => {
                      var arr = party_data.route
                        ? party_data.route[0].split(",")
                        : "";
                      if (arr == "") {
                        var u_data = {
                          id: party_data._id,
                          state: {
                            name: state_data.name,
                            id: party_data.state,
                          },
                          city: { name: city_data.name, id: party_data.city },
                          // district: {
                          //   name: district_data.name,
                          //   id: party_data.district,
                          // },
                          firmName: party_data.firmName,
                          party_unique_id: `${rowData.company_code}${rowData.party_code}`,
                          address1: party_data.address1,
                          address2: party_data.address2,
                          partyType: party_type_data.party_type,
                          image: party_data.image,
                          pincode: party_data.pincode,
                          GSTNo: party_data.GSTNo,
                          document: party_data.document,
                          contactPersonName: party_data.contactPersonName,
                          mobileNo: party_data.mobileNo,
                          email: party_data.email,
                          DOB: party_data.DOB,
                          DOA: party_data.DOA,
                          route: list,
                        };
                        res.json({
                          status: true,
                          message: " Party found successfully",
                          result: u_data,
                        });
                      } else {
                        for (let i = 0; i < arr.length; i++) {
                          Route.findOne({ _id: arr[i] })
                            .exec()
                            .then((route_data) => {
                              let data = {
                                route_name: route_data.route_name,
                                id: route_data._id,
                              };
                              list.push(data);
                              if (arr.length == i + 1) {
                                var u_data = {
                                  id: party_data._id,
                                  state: {
                                    name: state_data.name,
                                    id: party_data.state,
                                  },
                                  city: {
                                    name: city_data.name,
                                    id: party_data.city,
                                  },
                                  // district: {
                                  //   name: district_data.name,
                                  //   id: party_data.district,
                                  // },
                                  firmName: party_data.firmName,
                                  party_unique_id: `${rowData.company_code}${rowData.party_code}`,
                                  address1: party_data.address1,
                                  address2: party_data.address2,
                                  partyType: party_type_data.party_type,
                                  image: party_data.image,
                                  document: party_data.document,
                                  pincode: party_data.pincode,
                                  GSTNo: party_data.GSTNo,
                                  contactPersonName:
                                    party_data.contactPersonName,
                                  mobileNo: party_data.mobileNo,
                                  email: party_data.email,
                                  DOB: party_data.DOB,
                                  DOA: party_data.DOA,
                                  route: list,
                                };
                                res.json({
                                  status: true,
                                  message: " Party found successfully",
                                  result: u_data,
                                });
                              }
                            });
                        }
                      }
                    });
                  // })
                });
            });
        } else {
          res.json({
            status: true,
            message: "Party data not found",
            result: [],
          });
        }
      });
  } else {
    res.json({
      status: false,
      message: "Id is required",
    });
  }
});

router.post("/addBeatEmp", (req, res) => {
  // console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  var beatName = req.body.beatName ? req.body.beatName : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var day = req.body.day ? req.body.day : "";
  var route_id_arr = req.body.route_id_arr ? req.body.route_id_arr : null;
  if (state != "") {
    if (city != "") {
      if (beatName != "") {
        if (employee_id != "") {
          if (route_id_arr != null) {
            Employee.findOne({ _id: employee_id })
              .exec()
              .then((emp_data) => {
                Beat.find({ beatName: beatName })
                  .exec()
                  .then((beat_info) => {
                    if (beat_info.length < 1) {
                      var new_beat = new Beat({
                        beatName: beatName,
                        employee_id: emp_data._id,
                        day: day,
                        state: state,
                        city: city,
                        company_id: emp_data.companyId,
                        route: route_id_arr,
                        Created_date: get_current_date(),
                        Updated_date: get_current_date(),
                        status: "UnApproved",
                      });
                      new_beat.save().then((data) => {
                        res.status(200).json({
                          status: true,
                          message: "New Beat is created successfully",
                          result: data,
                        });
                      });
                    } else {
                      res.status(401).json({
                        status: true,
                        message: "Beat already exists",
                        result: [],
                      });
                    }
                  });
              });
          } else {
            return res.json({
              status: false,
              message: "Routes are required",
            });
          }
        } else {
          return res.json({
            status: false,
            message: "Employee id is required",
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Beat Name is required",
        });
      }
    } else {
      return res.json({
        status: false,
        message: "City is required",
      });
    }
  } else {
    return res.json({
      status: false,
      message: "State is required",
    });
  }
});

router.post("/getAllBeat", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  var page = req.body.page ? req.body.page : "1";
  var limit = 10;
  var count = await Beat.find({ employee_id });
  var list = [];
  Beat.find({ employee_id, company_id: emp_data.companyId })
    .sort({ status: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ Created_date: -1 })
    .exec()
    .then(async (beat_data) => {
      let counInfo = 0;
      if (beat_data.length > 0) {
        for (let i = 0; i < beat_data.length; i++) {
          let emp_data = await Employee.findOne({
            _id: beat_data[i].employee_id,
          });
          if (!emp_data) {
            res.json({
              status: true,
              message: "No employee found",
            });
          }
          let list2 = beat_data[i].route;
          let arr = [];
          for (let x = 0; x < list2.length; x++) {
            var route_data = await Route.findOne({ _id: list2[x] });
            let u_data = {
              route_name: route_data.route_name,
              route_id: route_data._id,
            };
            arr.push(u_data);
          }
          let state_data = await Location.findOne({ id: beat_data[i].state });
          let city_data = await Location.findOne({ id: beat_data[i].city });
          await (async function (rowData) {
            var u_data = {
              id: rowData._id,
              state: {
                name: state_data.name,
                id: beat_data[i].state,
              },
              city: {
                name: city_data.name,
                id: beat_data[i].city,
              },
              employee_name: emp_data.employeeName,
              route: arr,
              beatName: rowData.beatName,
              day: rowData.day,
              status: rowData.status,
            };
            list.push(u_data);
          })(beat_data[i]);
          counInfo++;
          if (counInfo == beat_data.length) {
            let c = Math.ceil(count.length / limit);
            if (c == 0) {
              c += 1;
            }
            res.json({
              status: true,
              message: "All Beats found successfully",
              result: list,
              pageLength: c,
            });
          }
        }
      } else {
        return res.json({
          status: true,
          message: "Beat not found",
          result: [],
        });
      }
    });
});

router.post("/beatListing", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var list = [];
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  Beat.find({ employee_id })
    .sort({ Created_date: -1 })
    .exec()
    .then(async (beat_data) => {
      let counInfo = 0;
      if (beat_data.length > 0) {
        for (let i = 0; i < beat_data.length; i++) {
          let emp_data = await Employee.findOne({
            _id: beat_data[i].employee_id,
          });
          if (!emp_data) {
            res.json({
              status: true,
              message: "No employee found",
            });
          }
          let list2 = beat_data[i].route;
          let arr = [];
          for (let x = 0; x < list2.length; x++) {
            var route_data = await Route.findOne({ _id: list2[x] });
            let u_data = {
              route_name: route_data.route_name,
            };
            arr.push(u_data);
          }
          let state_data = await Location.findOne({ id: beat_data[i].state });
          let city_data = await Location.findOne({ id: beat_data[i].city });
          await (async function (rowData) {
            var u_data = {
              id: rowData._id,
              state: {
                name: state_data.name,
                id: beat_data[i].state,
              },
              city: {
                name: city_data.name,
                id: beat_data[i].city,
              },
              employee_name: emp_data.employeeName,
              route: arr,
              beatName: rowData.beatName,
              day: rowData.day,
              status: rowData.status,
            };
            list.push(u_data);
          })(beat_data[i]);
          counInfo++;
          if (counInfo == beat_data.length) {
            res.json({
              status: true,
              message: "All Beats found successfully",
              result: list,
            });
          }
        }
      } else {
        return res.json({
          status: true,
          message: "Beat not found",
          result: [],
        });
      }
    });
});

router.post("/getBeat", async (req, res) => {
  var id = req.body.id ? req.body.id : "";
  let beat_data = await Beat.findOne({ _id: id });
  if (beat_data) {
    let state_data = await Location.findOne({ id: beat_data.state });
    let city_data = await Location.findOne({ id: beat_data.city });
    let emp_data = await Employee.findOne({ _id: beat_data.employee_id });
    let list2 = beat_data[i].route;
    let arr = [];
    for (let x = 0; x < list2.length; x++) {
      var route_data = await Route.findOne({ _id: list2[x] });
      let u_data = {
        route_name: route_data.route_name,
      };
      arr.push(u_data);
    }
    var u_data = {
      id: beat_data._id,
      state: { name: state_data.name, id: beat_data.state },
      city: { name: city_data.name, id: beat_data.city },
      employee_name: emp_data.employeeName,
      route: arr,
      day: beat_data.day,
      beatName: beat_data.beatName,
      status: beat_data.status,
    };
    res.json({
      status: true,
      message: "data fetched",
      result: [u_data],
    });
  } else {
    res.json({
      status: false,
      message: "Beat not found",
      result: [],
    });
  }
});

router.post("/editBeat", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    Beat.find({ _id: id })
      .exec()
      .then((beat_data) => {
        if (beat_data.length > 0) {
          var updated_beat = {};
          if (req.body.beatName) {
            updated_beat.beatName = req.body.beatName;
          }
          if (req.body.day) {
            updated_beat.day = req.body.day;
          }
          if (req.body.state) {
            updated_beat.state = req.body.state;
          }
          if (req.body.city) {
            updated_beat.city = req.body.city;
          }
          if (req.body.route_id_arr) {
            updated_beat.route = req.body.route_id_arr;
          }
          updated_beat.Updated_date = get_current_date();
          Beat.findOneAndUpdate(
            { _id: id },
            updated_beat,
            { new: true },
            (err, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Update successfully",
                  result: updated_beat,
                });
              }
            }
          );
        } else {
          res.json({
            status: false,
            message: "Beat not found.",
            result: null,
          });
        }
      });
  } else {
    return res.json({
      status: false,
      message: "Id is required",
      result: null,
    });
  }
});

router.post("/addRoute", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Please give token",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  var state = req.body.state ? req.body.state : "";
  var distance = req.body.distance ? req.body.distance : "";
  var city = req.body.city ? req.body.city : "";
  var route_name = req.body.route ? req.body.route : "";
  // var area = req.body.area ? req.body.area : "";
  var start_point = req.body.start_point ? req.body.start_point : "";
  var end_point = req.body.end_point ? req.body.end_point : "";
  if (state != "") {
    if (city != "") {
      Employee.findOne({ _id: employee_id })
        .exec()
        .then((emp_data) => {
          if (!emp_data) {
            res.json({
              status: true,
              message: "No employee found",
              result: [],
            });
          } else {
            var new_route = new Route({
              state: state,
              city: city,
              route_name: route_name,
              distance: distance,
              start_point: start_point,
              company_id: emp_data.companyId,
              end_point: end_point,
              Created_date: get_current_date(),
              Updated_date: get_current_date(),
              status: "Active",
            });
            new_route.save().then((data) => {
              res.json({
                status: true,
                message: "Route created successfully",
                result: data,
              });
            });
          }
        });
    } else {
      res.json({
        status: false,
        message: "City is required.",
      });
    }
  } else {
    res.json({
      status: false,
      message: "State is required.",
    });
  }
});

// router.post("/routeListing", (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     res.json({
//       status: false,
//       message: "Please give token",
//     });
//   }
//   let x = token.split(".")
// if(x.length<3){
//   return res.send({status:false,message:"Invalid token"})
// }
// var decodedToken = jwt.verify(token, "test");
//   var employee_id = decodedToken.user_id;
//   var state = req.body.state ? req.body.state : "";
//   var city = req.body.city ? req.body.city : "";
//   // var area = req.body.area ? req.body.area : "";
//   var limit = 10;
//   var list = [];
//   Employee.findOne({ _id: employee_id })
//     .exec()
//     .then(async (emp_data) => {
//       if (!emp_data) {
//         return res.json({
//           status: true,
//           message: "No employee found . Please check the token",
//         });
//       }
//       var count = await Route.find({ company_id: emp_data.companyId });
//       let arr = [];
//       if (state != "" && city == "") {
//         arr.push({ company_id: emp_data.companyId }, { state });
//       } else if (state != "" && city != "") {
//         arr.push({ company_id: emp_data.companyId }, { state }, { city });
//       } else {
//         arr.push({ company_id: emp_data.companyId });
//       }

//       Route.find({ $and: arr })
//         .exec()
//         .then((route_data) => {
//           if (route_data.length > 0) {
//             let counInfo = 0;
//             for (let i = 0; i < route_data.length; i++) {
//               Location.findOne({ _id: route_data[i].state })
//                 .exec()
//                 .then((state_data) => {
//                   Location.findOne({ _id: route_data[i].city })
//                     .exec()
//                     .then((city_data) => {
//                       Location.findOne({ _id: route_data[i].area })
//                         .exec()
//                         .then(async (area_data) => {
//                           await (async function (rowData) {
//                             var u_data = {
//                               id: rowData._id,
//                               state: {
//                                 name: state_data.name,
//                                 id: rowData.state,
//                               },
//                               city: {
//                                 name: city_data.name,
//                                 id: rowData.city,
//                               },
//                               area: {
//                                 name: area_data.name,
//                                 id: rowData.area,
//                               },
//                               start_point: rowData.start_point,
//                               distance: rowData.distance,
//                               end_point: rowData.end_point,
//                             };
//                             list.push(u_data);
//                           })(route_data[i]);
//                           counInfo++;
//                           if (counInfo == route_data.length) {
//                             res.json({
//                               status: true,
//                               message: "All Routes found successfully",
//                               result: list,
//                               pageLength: Math.ceil(count.length / limit),
//                             });
//                           }
//                         });
//                     });
//                 });
//             }
//           } else {
//             res.json({
//               status: false,
//               message: "No route found for this state",
//               result: [],
//             });
//           }
//         });
//     });
// });

router.post("/routeListing", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Please give token",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var list = [];
  Employee.findOne({ _id: employee_id })
    .exec()
    .then(async (emp_data) => {
      if (!emp_data) {
        return res.json({
          status: true,
          message: "No employee found . Please check the token",
        });
      }
      let arr = [];
      if (state != "" && city == "") {
        arr.push({ company_id: emp_data.companyId }, { state });
      } else if (state != "" && city != "") {
        arr.push({ company_id: emp_data.companyId }, { state }, { city });
      } else {
        arr.push({ company_id: emp_data.companyId });
      }

      Route.find({ $and: arr })
        .exec()
        .then(async (route_data) => {
          if (route_data.length > 0) {
            let counInfo = 0;
            for (let i = 0; i < route_data.length; i++) {
              await (async function (rowData) {
                var u_data = {
                  id: rowData._id,
                  route_name: rowData.route_name,
                  start_point: rowData.start_point,
                  distance: rowData.distance,
                  end_point: rowData.end_point,
                };
                list.push(u_data);
              })(route_data[i]);
              counInfo++;
              if (counInfo == route_data.length) {
                res.json({
                  status: true,
                  message: "All Routes found successfully",
                  result: list,
                });
              }
            }
          } else {
            res.json({
              status: false,
              message: "No route found for this state",
              result: [],
            });
          }
        });
    });
});

router.post("/unmapped_routeListing", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Please give token",
    });
  }
  let x = token.split(".");
  if (x.length < 3) {
    return res.send({ status: false, message: "Invalid token" });
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var list = [];
  Employee.findOne({ _id: employee_id })
    .exec()
    .then(async (emp_data) => {
      if (!emp_data) {
        return res.json({
          status: true,
          message: "No employee found . Please check the token",
        });
      }
      let arr = [];
      if (state != "" && city == "") {
        arr.push({ company_id: emp_data.companyId }, { state });
      } else if (state != "" && city != "") {
        arr.push({ company_id: emp_data.companyId }, { state }, { city });
      } else {
        arr.push({ company_id: emp_data.companyId });
      }
      arr.push({ is_mapped: false });
      Route.find({ $and: arr })
        .exec()
        .then(async (route_data) => {
          if (route_data.length > 0) {
            let counInfo = 0;
            for (let i = 0; i < route_data.length; i++) {
              await (async function (rowData) {
                var u_data = {
                  id: rowData._id,
                  route_name: rowData.route_name,
                  start_point: rowData.start_point,
                  distance: rowData.distance,
                  end_point: rowData.end_point,
                };
                list.push(u_data);
              })(route_data[i]);
              counInfo++;
              if (counInfo == route_data.length) {
                res.json({
                  status: true,
                  message: "All Routes found successfully",
                  result: list,
                });
              }
            }
          } else {
            res.json({
              status: false,
              message: "No route found for this state",
              result: [],
            });
          }
        });
    });
});

router.post("/edit_route", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    var updated_route = {};
    if (req.body.state) {
      updated_route.state = req.body.state;
    }
    if (req.body.city) {
      updated_route.city = req.body.city;
    }
    if (req.body.route_name) {
      updated_route.route = req.body.route;
    }
    if (req.body.distance) {
      updated_route.distance = req.body.distance;
    }
    if (req.body.start_point) {
      updated_route.start_point = req.body.start_point;
    }
    if (req.body.end_point) {
      updated_route.end_point = req.body.end_point;
    }
    Route.findOneAndUpdate(
      { _id: id },
      updated_route,
      { new: true },
      (err, doc) => {
        if (doc) {
          res.json({
            status: true,
            message: "Route updated successfully",
            result: updated_route,
          });
        } else {
          res.json({
            status: false,
            message: "Error",
            result: err,
          });
        }
      }
    );
  } else {
    res.json({
      status: false,
      message: "Id is required.",
    });
  }
});

//   router.delete("/deleteRoute", (req, res) => {
//     var id = req.body.id ? req.body.id : "";
//     Route.deleteOne({ _id: id })
//       .exec()
//       .then(() => {
//         res.json({
//           status: true,
//           message: "Deleted successfully",
//         });
//       });
//   });

module.exports = router;
