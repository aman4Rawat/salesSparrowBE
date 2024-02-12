const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const Admin = mongoose.model("AdminInfo");
const Retailer = mongoose.model("Retailer");
const Party = mongoose.model("Party");
const Beat = mongoose.model("Beat");
const EmployeeGrouping = mongoose.model("EmployeeGrouping");
const { validateEmail, validateMobile } = require('../../helper/helper')
const Role = mongoose.model("role");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
// const sid = "ACc3f03d291aaa9b78b8088eb0b77bf616";
// const auth_token = "b088eeb84d39bd2cc2679faea930b620";
// const twilio = require("twilio")(sid, auth_token);
const net = require('net')
const jwt = require("jsonwebtoken");
const XLSX = require("xlsx");
// const { AuthorizationDocumentInstance } = require("twilio/lib/rest/preview/hosted_numbers/authorizationDocument");

const imageStorage = multer.diskStorage({
  destination: "images/Employee_image",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
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

router.post("/addEmployee", imageUpload.fields([{ name: "Employee_image" }]), async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Token is required",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var user_id = decodedToken.user_id;
  var employeeName = req.body.employeeName ? req.body.employeeName : "";
  var headquarterState = req.body.headquarterState
    ? req.body.headquarterState
    : "";
  var headquarterCity = req.body.headquarterCity
    ? req.body.headquarterCity
    : "";
  var headquarterState_name = req.body.headquarterState_name
    ? req.body.headquarterState_name
    : "";
  var headquarterCity_name = req.body.headquarterCity_name
    ? req.body.headquarterCity_name
    : "";
  var phone = req.body.phone ? req.body.phone : "";
  var country = req.body.country ? req.body.country : "";
  var country_name = req.body.country_name ? req.body.country_name : "";
  var email = req.body.email ? req.body.email : "";
  var esi_no = req.body.esi_no ? req.body.esi_no : "";
  var pf_no = req.body.pf_no ? req.body.pf_no : "";
  var account_no = req.body.account_no ? req.body.account_no : "";
  var ifsc_code = req.body.ifsc_code ? req.body.ifsc_code : "";
  var bank_name = req.body.bank_name ? req.body.bank_name : "";
  if (email != "") {
    if (!validateEmail(email)) return res.json({ status: false, message: "Please provide a valid email" })
  }
  var address = req.body.address ? req.body.address : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var state_name = req.body.state_name ? req.body.state_name : "";
  var city_name = req.body.city_name ? req.body.city_name : "";
  var pincode = req.body.pincode ? req.body.pincode : "";
  // var district = req.body.district ? req.body.district : "";
  var experience = req.body.experience ? req.body.experience : "";
  var qualification = req.body.qualification ? req.body.qualification : "";
  if (employeeName != "") {
    if (phone != "") {
      // if (email != "") {
      if (address != "") {
        if (phone != "" && email != "") {
          var existing_employee_data = await Employee.find({ $or: [{ phone: phone }, { email }] });
          var existing_admin_data = await Admin.find({ $or: [{ phone: phone }, { email }] });
          var existing_retailer_data = await Retailer.find({ mobileNo: phone });
          var existing_party_data = await Party.find({ $or: [{ mobileNo: phone }, { email }] });
          if (existing_employee_data.length > 0) {
            return res.json({ status: false, message: "Phone or email already exists" })
          }
          if (existing_admin_data.length > 0) {
            return res.json({ status: false, message: "Phone or email already exists" })
          }
          if (existing_retailer_data.length > 0) {
            return res.json({ status: false, message: "Phone already exists" })
          }
          if (existing_party_data.length > 0) {
            return res.json({ status: false, message: "Phone or email already exists" })
          }
        } else if (phone != "" && email == "") {
          var existing_employee_data = await Employee.find({ $or: [{ phone: phone }] });
          var existing_admin_data = await Admin.find({ $or: [{ phone: phone }] });
          var existing_retailer_data = await Retailer.find({ mobileNo: phone });
          var existing_party_data = await Party.find({ $or: [{ mobileNo: phone }] });
          if (existing_employee_data.length > 0) {
            return res.json({ status: false, message: "Phone number already exists" })
          }
          if (existing_admin_data.length > 0) {
            return res.json({ status: false, message: "Phone number already exists" })
          }
          if (existing_retailer_data.length > 0) {
            return res.json({ status: false, message: "Phone number already exists" })
          }
          if (existing_party_data.length > 0) {
            return res.json({ status: false, message: "Phone number already exists" })
          }
        }
        Employee.find({ email: email, phone: phone }).exec().then(async (data) => {
          if (data.length < 1) {
            let company = await Admin.findOne({ _id: user_id });
            var emp_data = await Employee.findOne({ companyId: company._id }).sort({ employee_code: -1 });
            if (emp_data) {
              var employee_code = emp_data.employee_code + 1;
            } else {
              var employee_code = 1;
            }
            var new_employee = new Employee({
              employeeName: employeeName,
              phone: phone,
              email: email,
              address: address,
              esi_no: esi_no,
              pf_no: pf_no,
              account_no: account_no,
              ifsc_code: ifsc_code,
              bank_name: bank_name,
              country: company.country,
              company_code: company.companyShortCode + "E",
              employee_code: employee_code,
              headquarterState: headquarterState,
              headquarterCity: headquarterCity,
              city: city,
              headquarterState_name: headquarterState_name,
              headquarterCity_name: headquarterCity_name,
              city_name: city_name,
              companyId: user_id,
              image: base_url + req.files.Employee_image[0].path,
              state: state,
              state_name: state_name,
              // district: district,
              pincode: pincode,
              qualification: qualification,
              experience: experience,
              Created_date: get_current_date(),
              Updated_date: get_current_date(),
              status: "Active",
            });
            new_employee.save().then((data) => {
              console.log(data)
              res.status(200).json({
                status: true,
                message: "New Employee is created successfully",
                results: data,
              });
            });
          } else {
            res.json({
              status: false,
              message: "Employee already exists",
              result: null,
            });
          }
        });
      } else {
        return res.json({
          status: false,
          message: "Address is required",
          results: null,
        });
      }
      // } else {
      //   return res.json({
      //     status: false,
      //     message: "Email is required",
      //     results: null,
      //   });
      // }
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

router.patch("/editEmployee", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    Employee.find({ _id: id })
      .exec()
      .then(async (employee_info) => {
        if (employee_info.length > 0) {
          var updated_employee = {};
          if (req.body.employeeName) {
            updated_employee.employeeName = req.body.employeeName;
          }
          if (req.body.deviceToken) {
            updated_employee.deviceToken = req.body.deviceToken;
          }
          if (req.body.userExpenses) {
            updated_employee.userExpenses = req.body.userExpenses;
          }
          if (req.body.headquarterState) {
            updated_employee.headquarterState = req.body.headquarterState;
          }
          if (req.body.headquarterCity) {
            updated_employee.headquarterCity = req.body.headquarterCity;
          }
          if (req.body.esi_no) {
            updated_employee.esi_no = req.body.esi_no;
          }
          if (req.body.pf_no) {
            updated_employee.pf_no = req.body.pf_no;
          }
          if (req.body.account_no) {
            updated_employee.account_no = req.body.account_no;
          }
          if (req.body.ifsc_code) {
            updated_employee.ifsc_code = req.body.ifsc_code;
          }
          if (req.body.bank_name) {
            updated_employee.bank_name = req.body.bank_name;
          }
          if (req.body.headquarterState_name) {
            updated_employee.headquarterState_name = req.body.headquarterState_name;
          }
          if (req.body.headquarterCity_name) {
            updated_employee.headquarterCity_name = req.body.headquarterCity_name;
          }
          if (req.body.transportWays) {
            updated_employee.transportWays = req.body.transportWays;
          }
          if (req.body.roleId) {
            updated_employee.roleId = req.body.roleId;
          }
          if (req.body.manager) {
            updated_employee.manager = req.body.manager;
          }
          if (req.body.phone) {
            updated_employee.phone = req.body.phone;
          }
          if (req.body.email) {
            updated_employee.email = req.body.email;
          }
          if (req.body.address) {
            updated_employee.address = req.body.address;
          }
          if (req.body.city) {
            updated_employee.city = req.body.city;
          }
          if (req.body.state) {
            updated_employee.state = req.body.state;
          }
          if (req.body.city_name) {
            updated_employee.city_name = req.body.city_name;
          }
          if (req.body.state_name) {
            updated_employee.state_name = req.body.state_name;
          }
          if (req.body.country) {
            updated_employee.country = req.body.country;
          }
          if (req.body.country_name) {
            updated_employee.country_name = req.body.country_name;
          }
          if (req.body.pincode) {
            updated_employee.pincode = req.body.pincode;
          }
          // if (req.body.district) {
          //   updated_employee.district = req.body.district;
          // }
          if (req.body.experience) {
            updated_employee.experience = req.body.experience;
          }
          if (req.body.qualification) {
            updated_employee.qualification = req.body.qualification;
          }
          if (req.body.status) {
            updated_employee.status = req.body.status;
          }
          updated_employee.Updated_date = get_current_date();
          Employee.findOneAndUpdate(
            { _id: id },
            updated_employee,
            { new: true },
            (err, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Update successfully",
                  results: updated_employee,
                });
              }
            }
          );
        } else {
          res.json({
            status: false,
            message: "Employee not found.",
            result: null,
          });
        }
      });
  } else {
    return res.json({
      status: false,
      message: "ID is required",
      result: null,
    });
  }
});

router.post("/getAllEmployee", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var user_id = decodedToken.user_id;
  var page = req.body.page ? req.body.page : "1";
  var state = req.body.state ? req.body.state : "";
  var employee_id = req.body.employee_id ? req.body.employee_id : "";
  var search = req.body.search ? req.body.search : "";
  var status = req.body.status ? req.body.status : "";
  var limit = req.body.limit ? req.body.limit : 10;
  let arr = [{ is_delete: "0" }];
  if (search != "") {
    var regex = new RegExp(search, 'i');
    arr.push({ employeeName: regex })
  }
  if (status != "") {
    arr.push({status: {$in: ['Approved', "Active"]}})
  }
  if (state != "") {
    arr.push({ companyId: user_id }, { headquarterState: state });
  } else {
    arr.push({ companyId: user_id });
  }
  if (employee_id != "") arr.push({ _id: employee_id })
  var list = [];
  var emp_data = await Employee.find({ $and: arr }).sort({ status: -1 }).limit(limit * 1).skip((page - 1) * limit)
  let count = await Employee.find({ $and: arr });
  if (emp_data.length > 0) {
    let counInfo = 0;
    for (let i = 0; i < emp_data.length; i++) {
      let role_data = await Role.findOne({ _id: emp_data[i].roleId });
      let assigned_beat_data = await Beat.find({ employee_id: emp_data[i]._id });
      let beat_list = []
      if (assigned_beat_data.length > 0) {
        for (let j = 0; j < assigned_beat_data.length; j++) {
          let u_data = {
            beat_name: assigned_beat_data[j].beatName,
            beat_id: assigned_beat_data[j]._id
          }
          beat_list.push(u_data)
        }
      }
      if (!role_data) {
        await (async function (rowData) {
          let state_data = await Location.findOne({
            id: emp_data[i].state,
          });
          let headquarter_state_data = await Location.findOne({
            id: emp_data[i].headquarterState,
          });
          let headquarter_city_data = await Location.findOne({
            id: emp_data[i].headquarterCity,
          });
          let city_data = await Location.findOne({ id: emp_data[i].city });
          // let area_data = await Location.findOne({
          //   _id: emp_data[i].district,
          // });
          var u_data = {
            id: rowData._id,
            employeeName: rowData.employeeName,
            phone: rowData.phone,
            email: rowData.email,
            address: rowData.address,
            employee_unique_id: `${rowData.company_code}${rowData.employee_code}`,
            pincode: rowData.pincode,
            image: rowData.image,
            esi_no: rowData.esi_no || '',
            pf_no: rowData.pf_no || '',
            account_no: rowData.account_no || '',
            ifsc_code: rowData.ifsc_code || '',
            bank_name: rowData.bank_name || '',
            state: {
              name: state_data?.name,
              id: state_data?.id,
            },
            headquarterState: {
              name: headquarter_state_data?.name,
              id: headquarter_state_data?.id
            },
            headquarterCity: {
              name: headquarter_city_data?.name,
              id: headquarter_city_data?.id
            },
            city: {
              name: city_data?.name,
              id: city_data?.id,
            },
            beats: beat_list,
            // country: {
            //   name: rowData.country_name,
            //   id: rowData.country,
            // },
            // district: {
            //   name: area_data.name,
            //   id: area_data._id,
            // },
            experience: rowData.experience,
            qualification: rowData.qualification,
            status: rowData.status,
            role: "SA",
          };
          list.push(u_data);
        })(emp_data[i]);
        counInfo++;
        if (counInfo == emp_data.length) {
          if (page != "") {
            res.json({
              status: true,
              message: "All Employees found successfully",
              result: list,
              pageLength: Math.ceil(count.length / limit),
              count: count.length
            });
          } else {
            res.json({
              status: true,
              message: "All Employees found successfully",
              result: list,
            });
          }
        }
      } else {
        await (async function (rowData) {
          let state_data = await Location.findOne({
            id: emp_data[i].state,
          });
          let headquarter_state_data = await Location.findOne({
            id: emp_data[i].headquarterState,
          });
          let headquarter_city_data = await Location.findOne({
            id: emp_data[i].headquarterCity,
          });
          let city_data = await Location.findOne({ id: emp_data[i].city });
          // let area_data = await Location.findOne({
          //   _id: emp_data[i].district,
          // });
          let role_data = await Role.findOne({ _id: emp_data[i].roleId });
          var u_data = {
            id: rowData._id,
            employeeName: rowData.employeeName,
            phone: rowData.phone,
            email: rowData.email,
            address: rowData.address,
            esi_no: rowData.esi_no || '',
            pf_no: rowData.pf_no || '',
            account_no: rowData.account_no || '',
            ifsc_code: rowData.ifsc_code || '',
            bank_name: rowData.bank_name || '',
            employee_unique_id: `${rowData.company_code}${rowData.employee_code}`,
            pincode: rowData.pincode,
            image: rowData.image,
            state: {
              name: state_data.name,
              id: state_data._id,
            },
            headquarterState: {
              name: headquarter_state_data
                ? headquarter_state_data.name
                : "",
              id: headquarter_state_data ? headquarter_state_data._id : "",
            },
            headquarterCity: {
              name: headquarter_city_data ? headquarter_city_data.name : "",
              id: headquarter_city_data ? headquarter_city_data._id : "",
            },
            city: {
              name: city_data.name,
              id: city_data._id,
            },
            beats: beat_list,
            // district: {
            //   name: area_data.name,
            //   id: area_data._id,
            // },
            experience: rowData.experience,
            qualification: rowData.qualification,
            status: rowData.status,
            role: role_data.rolename,
          };
          list.push(u_data);
        })(emp_data[i]);
        counInfo++;
        if (counInfo == emp_data.length) {
          if (page != "") {
            res.json({
              status: true,
              message: "All Employees found successfully",
              result: list,
              pageLength: Math.ceil(count.length / limit),
              count: count.length
            });
          } else {
            res.json({
              status: true,
              message: "All Employees found successfully",
              result: list,
            });
          }
        }
      }
    }
  } else {
    res.json({
      status: false,
      message: "No employee found",
      result: [],
    });
  }
});

router.post("/employeeProfileImage", imageUpload.fields([{ name: "Employee_image" }]), (req, res) => {
  console.log(req.files);
  const id = req.body.id ? req.body.id : "";
  if (id != "") {
    Employee.find({ _id: id })
      .exec()
      .then((user_data) => {
        if (user_data) {
          updated_employee = {};
          if (req.files.Employee_image) {
            updated_employee.image =
              base_url + req.files.Employee_image[0].path;
          }
          Employee.findOneAndUpdate(
            { _id: id },
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
  } else {
    res.json({
      status: false,
      message: "Id is required.",
    });
  }
}
);

router.delete("/deleteEmployee", async (req, res) => {
  var id = req.body.id ? req.body.id : "";
  let emp_grp_data = await EmployeeGrouping.find({ emp_id: id });
  for (let i = 0; i < emp_grp_data.length; i++) {
    await EmployeeGrouping.findOneAndUpdate({ emp_id: id }, { $set: { is_delete: "1", is_login: false, device_id: "", deviceToken: "" } })
  }
  Employee.findOneAndUpdate({ _id: id }, { $set: { is_delete: "1" } })
    .exec()
    .then((employee_data) => {
      res.json({
        status: true,
        message: "Employee deleted successfully",
      });
    });
});

router.post("/getEmp", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.json({
      status: false,
      message: "Token is required",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var user_id = decodedToken.user_id;
  Employee.findOne({ $and: [{ _id: id }, { companyId: user_id }] })
    .exec()
    .then((employee_data) => {
      console.log(employee_data);
      if (!employee_data) {
        return res.json({
          status: true,
          message: "No employee found",
        });
      }
      Location.findOne({ id: employee_data.state })
        .exec()
        .then((state_data) => {
          Location.findOne({ id: employee_data.headquarterState })
            .exec()
            .then((headquarter_state_data) => {
              Location.findOne({ id: employee_data.headquarterCity })
                .exec()
                .then((headquarter_city_data) => {
                  Location.findOne({ id: employee_data.city })
                    .exec()
                    .then((city_data) => {
                      // Location.findOne({ _id: employee_data.district })
                      //   .exec()
                      //   .then(async (area_data) => {
                      if (!employee_data.roleId) {
                        var u_data = {
                          employeeName: employee_data.employeeName,
                          id: employee_data._id,
                          roleId: "",
                          companyId: employee_data.companyId,
                          team_view: employee_data.team_view ?? true,
                          gps_alarm: employee_data.gps_alarm ?? true,
                          esi_no: employee_data.esi_no || '',
                          pf_no: employee_data.pf_no || '',
                          account_no: employee_data.account_no || '',
                          ifsc_code: employee_data.ifsc_code || '',
                          bank_name: employee_data.bank_name || '',
                          track_user: employee_data.track_user ?? true,
                          phone: employee_data.phone,
                          email: employee_data.email,
                          employee_unique_id: `${employee_data.company_code}${employee_data.employee_code}`,
                          address: employee_data.address,
                          pincode: employee_data.pincode,
                          state: state_data.name,
                          headquarterState: headquarter_state_data.name,
                          headquarterCity: headquarter_city_data.name,
                          image: employee_data.image,
                          city: city_data.name,
                          // district: area_data.name,
                          experience: employee_data.experience,
                          qualification: employee_data.qualification,
                          userExpenses: employee_data.userExpenses,
                          transportWays: employee_data.transportWays,
                          status: employee_data.status,
                        };
                        res.json({
                          status: true,
                          message: "Employee found successfully",
                          result: u_data,
                        });
                      } else {
                        Employee.findOne({
                          $and: [{ _id: id }, { companyId: user_id }],
                        })
                          .exec()
                          .then((employee_data) => {
                            console.log(
                              "inside else ----------",
                              employee_data
                            );
                            console.log(
                              "inside else ----------",
                              employee_data.manager
                            );
                            Role.findOne({ _id: employee_data.roleId })
                              .exec()
                              .then((role_data) => {
                                if (
                                  employee_data.manager == "" ||
                                  employee_data.manager == undefined
                                ) {
                                  var u_data = {
                                    id: employee_data._id,
                                    employeeName:
                                      employee_data.employeeName,
                                    roleId: {
                                      name: role_data.rolename,
                                      id: role_data._id,
                                    },
                                    team_view: employee_data.team_view ?? true,
                                    gps_alarm: employee_data.gps_alarm ?? true,
                                    track_user: employee_data.track_user ?? true,
                                    companyId: employee_data.companyId,
                                    phone: employee_data.phone,
                                    esi_no: employee_data.esi_no || '',
                                    pf_no: employee_data.pf_no || '',
                                    account_no: employee_data.account_no || '',
                                    ifsc_code: employee_data.ifsc_code || '',
                                    bank_name: employee_data.bank_name || '',
                                    email: employee_data.email,
                                    employee_unique_id: `${employee_data.company_code}${employee_data.employee_code}`,
                                    address: employee_data.address,
                                    pincode: employee_data.pincode,
                                    state: state_data.name,
                                    headquarterState:
                                      headquarter_state_data.name,
                                    headquarterCity:
                                      headquarter_city_data.name,
                                    image: employee_data.image,
                                    city: city_data.name,
                                    // district: area_data.name,
                                    experience: employee_data.experience,
                                    qualification:
                                      employee_data.qualification,
                                    userExpenses:
                                      employee_data.userExpenses,
                                    transportWays:
                                      employee_data.transportWays,
                                    status: employee_data.status,
                                  };
                                  res.json({
                                    status: true,
                                    message: "Employee found successfully",
                                    result: u_data,
                                  });
                                } else {
                                  Employee.findOne({
                                    _id: employee_data.manager,
                                  })
                                    .exec()
                                    .then((manager_data) => {
                                      var u_data = {
                                        employeeName:
                                          employee_data.employeeName,
                                        roleId: {
                                          name: role_data.rolename,
                                          id: role_data._id,
                                        },
                                        companyId: employee_data.companyId,
                                        id: employee_data._id,
                                        manager: manager_data.employeeName,
                                        phone: employee_data.phone,
                                        employee_unique_id: `${employee_data.company_code}${employee_data.employee_code}`,
                                        email: employee_data.email,
                                        esi_no: employee_data.esi_no || '',
                                        pf_no: employee_data.pf_no || '',
                                        account_no: employee_data.account_no || '',
                                        ifsc_code: employee_data.ifsc_code || '',
                                        bank_name: employee_data.bank_name || '',
                                        address: employee_data.address,
                                        team_view: employee_data.team_view ?? true,
                                        gps_alarm: employee_data.gps_alarm ?? true,
                                        track_user: employee_data.track_user ?? true,
                                        pincode: employee_data.pincode,
                                        state: state_data.name,
                                        headquarterState:
                                          headquarter_state_data.name,
                                        headquarterCity:
                                          headquarter_city_data.name,
                                        image: employee_data.image,
                                        city: city_data.name,
                                        // district: area_data.name,
                                        experience:
                                          employee_data.experience,
                                        qualification:
                                          employee_data.qualification,
                                        userExpenses:
                                          employee_data.userExpenses,
                                        transportWays:
                                          employee_data.transportWays,
                                        status: employee_data.status,
                                      };
                                      res.json({
                                        status: true,
                                        message:
                                          "Employee found successfully",
                                        result: u_data,
                                      });
                                    });
                                }
                              });
                          });
                      }
                      // });
                    });
                });
            });
        });
    });
});

router.post("/bulkImportEmployee", imageUpload.fields([{ name: "employee_excel" }]), async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token must be provided", });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let company = await Admin.findOne({ _id: company_id })

  var workbook = XLSX.readFile(req.files.employee_excel[0].path);
  var sheet_namelist = workbook.SheetNames;
  var x = 0;
  var list = [];
  let countInfo = 0;
  sheet_namelist.forEach(async (element) => {
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
    if (!xlData.length) return res.json({ status: true, message: "List is empty" })
    for (let i = 0; i < xlData.length; i++) {
      var emp_data2 = await Employee.findById(xlData[i].ID).sort({ employee_code: -1 });
      if (!emp_data2) {
        var emp_data = await Employee.findOne({ companyId: company._id }).sort({ employee_code: -1 });
        if (emp_data) {
          var employee_code = emp_data.employee_code + 1;
        } else {
          var employee_code = 1;
        }
        Location.findOne({ name: xlData[i].State }).exec().then((state_data) => {
          Location.findOne({ name: xlData[i].City }).exec().then((city_data) => {
            Location.findOne({ name: xlData[i].Headquarter_State }).exec().then((headquarter_state_data) => {
              Location.findOne({ name: xlData[i].Headquarter_City }).exec().then((headquarter_city_data) => {
                var new_emp = new Employee({
                  employeeName: xlData[i].Employee_Name,
                  phone: xlData[i].Phone_Number,
                  email: xlData[i].Email,
                  address: xlData[i].Address,
                  city: city_data._id,
                  companyId: company_id,
                  image: xlData[i].Profile_Image,
                  headquarterState: headquarter_state_data._id,
                  headquarterCity: headquarter_city_data._id,
                  state: state_data._id,
                  pincode: xlData[i].Pincode,
                  qualification: xlData[i].Qualification,
                  experience: xlData[i].Experience,
                  Created_date: get_current_date(),
                  Updated_date: get_current_date(),
                  status: xlData[i].Status,

                  esi_no: xlData[i].ESI_Number,
                  pf_no: xlData[i].PF_Number,
                  account_no: xlData[i].Account_Number,
                  ifsc_code: xlData[i].IFSC_Code,
                  bank_name: xlData[i].Bank_Name,
                  country: company.country,
                  company_code: company.companyShortCode + "E",
                  employee_code: employee_code,
                });
                new_emp.save();
                list.push(new_emp);
                countInfo++;
                console.log("employee imported")
                if (countInfo == xlData.length) {
                  return res.status(200).json({
                    status: true,
                    message: `${list.length} Employees imported successfully.`,
                    result: list,
                    count: list.length,
                  });
                }
              });
            });
            // });
          });
        });
      } else {
        countInfo++;
        console.log("emp already exist")
        if (countInfo == xlData.length) {
          return res.status(200).json({
            status: true,
            message: `All Employees already exist.`,
            result: list,
            count: list.length,
          });
        }
      }
    }
    x++;
  });
  // return res.status(200).json({
  //   status: true,
  //   message: "Data imported successfully",
  //   result: list,
  //   countInfo,
  // });
}
);

router.post('/reset_device', async (req, res) => {
  let emp_id = req.body.emp_id ? req.body.emp_id : "";
  if (emp_id == "") return res.json({ status: false, message: "Please select the employee" })
  try {
    await Employee.findByIdAndUpdate({ _id: emp_id }, { $set: { device_id: "", deviceToken: "", is_login: false } })
    res.json({ status: true, message: "Reset successful" })
  } catch (err) {
    console.log('err--', err);
    res.json({ status: false, message: 'Error' })
  }
})

router.post('/device_config', async (req, res) => {
  let emp_id = req.body.emp_id ? req.body.emp_id : "";
  if (emp_id == "") return res.json({ status: false, message: "Please select the employee" })
  try {
    let updated_employee = {}
    if (req.body.team_view == true || req.body.team_view == false) {
      updated_employee.team_view = req.body.team_view;
    }
    if (req.body.gps_alarm == true || req.body.gps_alarm == false) {
      updated_employee.gps_alarm = req.body.gps_alarm;
    }
    if (req.body.track_user == true || req.body.track_user == false) {
      updated_employee.track_user = req.body.track_user;
    }
    Employee.findOneAndUpdate({ _id: emp_id }, updated_employee, { new: true }).then(async (data) => {
      // Create a socket connection
      const client = new net.Socket();

      // Connect to the socket server
      client.connect(5000, '159.89.165.93', () => {
        console.log('client connected----------');

        // emit event to server
        client.emit('teamview', data);

      });
      // On the server side
      client.on('teamview', (emp_data) => {
        console.log('Team view event received with emp_data:', emp_data);
      });

    })
    return res.json({ status: true, message: "Configured successful" })
  } catch (err) {
    console.log('err--', err);
    res.json({ status: false, message: 'Error' })
  }
})

module.exports = router;
