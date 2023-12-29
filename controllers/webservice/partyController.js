const express = require("express");
const mongoose = require("mongoose");
const Party = mongoose.model("Party");
const Location = mongoose.model("Location");
const Route = mongoose.model("Route");
const Admin = mongoose.model("AdminInfo");
const PartyType = mongoose.model("PartyType");
const Employee = mongoose.model("Employee");
const Retailer = mongoose.model("Retailer");
const PartyGrouping = mongoose.model("PartyGrouping");
const Mapping = mongoose.model("Mapping");
const router = express.Router();
const jwt = require("jsonwebtoken");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const XLSX = require("xlsx");
const { Router } = require("express");

const imageStorage = multer.diskStorage({
  destination: "images/party_image",
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

router.post("/addParty", imageUpload.fields([{ name: "Party_image" }]), async (req, res) => {
  console.log("addParty -------------------->", req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  var partyType = req.body.partyType ? req.body.partyType : "";
  var firmName = req.body.firmName ? req.body.firmName : "";
  var GSTNo = req.body.GSTNo ? req.body.GSTNo : null;
  var contactPersonName = req.body.contactPersonName
    ? req.body.contactPersonName
    : "";
  var mobileNo = req.body.mobileNo ? req.body.mobileNo : "";
  var email = req.body.email ? req.body.email : "";
  var pincode = req.body.pincode ? req.body.pincode : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  // var district = req.body.district ? req.body.district : "";
  var address1 = req.body.address1 ? req.body.address1 : "";
  var address2 = req.body.address2 ? req.body.address2 : "";
  var DOB = req.body.DOB ? req.body.DOB : "";
  var DOA = req.body.DOA ? req.body.DOA : "";
  var route = req.body.route ? req.body.route : "";
  if (partyType != "") {
    if (firmName != "") {
      if (mobileNo != "") {
        if (pincode != "") {
          if (city != "") {
            if (state != "") {
              if (address1 != "") {
                if (email != "") {
                  var existing_employee_data = await Employee.find({ $or: [{ phone: mobileNo }, { email }] });
                  var existing_admin_data = await Admin.find({ $or: [{ phone: mobileNo }, { email }] });
                  var existing_retailer_data = await Retailer.find({ mobileNo: mobileNo });
                  var existing_party_data = await Party.find({ $or: [{ mobileNo: mobileNo }, { email }] });
                  if (existing_employee_data.length > 0) {
                    return res.json({ status: false, message: "Phone or email already exists" })
                  }
                  if (existing_admin_data.length > 0) {
                    return res.json({ status: false, message: "Phone or email already exists" })
                  }
                  if (existing_retailer_data.length > 0) {
                    return res.json({ status: false, message: "Phone number already exists" })
                  }
                  if (existing_party_data.length > 0) {
                    return res.json({ status: false, message: "Phone or email already exists" })
                  }
                } else if (email == "") {
                  var existing_employee_data = await Employee.find({ $or: [{ phone: mobileNo }] });
                  var existing_admin_data = await Admin.find({ $or: [{ phone: mobileNo }] });
                  var existing_retailer_data = await Retailer.find({ mobileNo: mobileNo });
                  var existing_party_data = await Party.find({ $or: [{ mobileNo: mobileNo }] });
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
                let company = await Admin.findOne({ _id: company_id });
                var party_data = await Party.findOne({ company_id: company._id }).sort({ party_code: -1 });
                let party_code;
                if (party_data) {
                  party_code = party_data.party_code + 1;
                } else {
                  party_code = 1;
                }
                let x = route.split(",")
                for (let i = 0; i < x.length; i++) {
                  await Route.findByIdAndUpdate({ _id: x[i] }, { $set: { is_mapped: true } }, { new: true })
                }
                var new_party = new Party({
                  partyType: partyType,
                  firmName: firmName,
                  GSTNo: GSTNo,
                  image: base_url + req.files.Party_image[0].path,
                  contactPersonName: contactPersonName,
                  company_code: company.companyShortCode + "P",
                  party_code: party_code,
                  mobileNo: mobileNo,
                  email: email,
                  company_id: company_id,
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
                  status: "Active",
                });
                new_party.save().then((data) => {
                  res.status(200).json({
                    status: true,
                    message: "Party created successfully",
                    result: data,
                  });
                });
              } else {
                res.json({
                  status: false,
                  message: "address is required",
                });
              }
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

router.post("/editParty", (req, res) => {
  console.log(req.body);
  var id = req.body.id ? req.body.id : "";
  Party.findOne({ _id: id }).exec().then(async (party_data) => {
    if (party_data) {
      let a = party_data.route[0].split(",")
      console.log('route in party-------', party_data.route);
      for (let i = 0; i < a.length; i++) {
        if (a[i] != "") {
          await Route.findByIdAndUpdate({ _id: a[i] }, { $set: { is_mapped: false } }, { new: true })
        }
      }
      var updated_party = {};
      if (req.body.partyType) {
        updated_party.partyType = req.body.partyType;
      }
      if (req.body.firmName) {
        updated_party.firmName = req.body.firmName;
      }
      updated_party.route = req.body.route;
      if (req.body.GSTNo) {
        updated_party.GSTNo = req.body.GSTNo;
      }
      if (req.body.mobileNo) {
        updated_party.mobileNo = req.body.mobileNo;
      }
      if (req.body.pincode) {
        updated_party.pincode = req.body.pincode;
      }
      if (req.body.city) {
        updated_party.city = req.body.city;
      }
      if (req.body.state) {
        updated_party.state = req.body.state;
      }
      if (req.body.DOB) {
        updated_party.DOB = req.body.DOB;
      }
      // if (req.body.district) {
      //   updated_party.district = req.body.district;
      // }
      if (req.body.DOA) {
        updated_party.DOA = req.body.DOA;
      }
      if (req.body.email) {
        updated_party.email = req.body.email;
      }
      if (req.body.contactPersonName) {
        updated_party.contactPersonName = req.body.contactPersonName;
      }
      if (req.body.address1) {
        updated_party.address1 = req.body.address1;
      }
      if (req.body.address2) {
        updated_party.address2 = req.body.address2;
      }
      if (req.body.status) {
        updated_party.status = req.body.status;
      }
      updated_party.Updated_date = get_current_date();
      Party.findOneAndUpdate(
        { _id: id },
        updated_party,
        { new: true },
        async (err, doc) => {
          if (doc) {
            console.log('inside doc------');
            let x = req.body.route.split(",")
            console.log('x------', x);
            for (let i = 0; i < x.length; i++) {
              console.log('inside for loop-------');
              if (x[i] != '') {

                await Route.findByIdAndUpdate({ _id: x[i] }, { $set: { is_mapped: true } }, { new: true })
              }
            }
            res.status(200).json({
              status: true,
              message: "Update successfully",
              results: updated_party,
            });
          }
        }
      );
    } else {
      res.json({
        status: false,
        message: "Party not exist",
      });
    }
  });
});

router.post("/getAllParty", async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  if (employee_id == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided",
      });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var page = req.body.page ? req.body.page : "1";
    var search = req.body.search ? req.body.search : "";
    var limit = req.body.limit ? req.body.limit : 10;
    var count = await Party.find({ company_id });
    var list = [];
    var list2 = [];
    var state = req.body.state ? req.body.state : "";
    var partyType = req.body.partyType ? req.body.partyType : "";
    let obj1 = [{ is_delete: "0" }];
    if (company_id != "" && state == "" && partyType == "") {
      obj1 = [{ company_id }];
    } else if (company_id != "" && state != "" && partyType == "") {
      obj1 = [{ company_id }, { state }];
    } else if (company_id != "" && state == "" && partyType != "") {
      obj1 = [{ company_id }, { partyType }];
    } else if (company_id != "" && state != "" && partyType != "") {
      obj1 = [{ company_id }, { state }, { partyType }];
    }
    if (search != "") {
      var regex = new RegExp(search, 'i');
      obj1.push({ firmName: regex })
    }
    // await Party.updateMany({is_delete:"0"},{$set:{is_mapped:false}})
    Party.find({ $and: obj1 }).sort({ "status": -1 }).limit(limit * 1).skip((page - 1) * limit).exec().then(async (party_data) => {
      if (party_data.length > 0) {
        let counInfo = 0;
        for (let i = 0; i < party_data.length; i++) {
          var arr = party_data[i].route ? party_data[i].route[0].split(",") : "";
          if (arr == "") {
            await (async function (rowData) {
              var state_data = await Location.findOne({
                id: party_data[i].state,
              });
              var city_data = await Location.findOne({
                id: party_data[i].city,
              });
              var party_type_data = await PartyType.findOne({
                _id: party_data[i].partyType,
              });
              console.log("party_data[i] ------------------>", party_data[i])
              // console.log("state_data ------------------>", state_data)
              var u_data = {
                id: rowData._id,
                state: { name: state_data?.name, id: rowData.state },
                city: { name: city_data?.name, id: rowData.city },
                firmName: rowData.firmName,
                partyType: party_type_data.party_type,
                partyid: `${rowData.company_code}${rowData.party_code}`,
                image: rowData.image,
                pincode: rowData.pincode,
                document: rowData.document || [],
                GSTNo: rowData.GSTNo,
                contactPersonName: rowData.contactPersonName,
                mobileNo: rowData.mobileNo,
                email: rowData.email,
                DOB: rowData.DOB,
                DOA: rowData.DOA,
                route: list2,
                areas: rowData.address,
                status: rowData.status,
              };
              list.push(u_data);
            })(party_data[i]);
            counInfo++;
            if (counInfo == party_data.length) {
              let c = Math.ceil(count.length / limit);
              if (c == 0) {
                c += 1;
              }
              res.json({
                status: true,
                message: "Parties for this state found successfully",
                result: list,
                pageLength: c,
                count: count.length
              });
            }
          } else {
            for (let j = 0; j < arr.length; j++) {
              var state_data = await Location.findOne({
                id: party_data[i].state,
              });
              var city_data = await Location.findOne({
                id: party_data[i].city,
              });
              // var district_data = await Location.findOne({
              //   _id: party_data[i].district,
              // });
              var party_type_data = await PartyType.findOne({
                _id: party_data[i].partyType,
              });
              var route_data = await Route.findOne({ _id: arr[j] })
              let data = {
                route_name: route_data.route_name,
                id: route_data._id,
              };
              list2.push(data);
              if (arr.length == j + 1) {
                await (async function (rowData) {
                  var u_data = {
                    id: rowData._id,
                    state: {
                      name: state_data.name,
                      id: rowData.state,
                    },
                    city: {
                      name: city_data.name,
                      id: rowData.city,
                    },
                    // district: {
                    //   name: district_data.name,
                    //   id: rowData.district,
                    // },
                    firmName: rowData.firmName,
                    partyType: party_type_data.party_type,
                    pincode: rowData.pincode,
                    partyid: `${rowData.company_code}${rowData.party_code}`,
                    image: rowData.image,
                    contactPersonName: rowData.contactPersonName,
                    GSTNo: rowData.GSTNo,
                    document: rowData.document || [],
                    mobileNo: rowData.mobileNo,
                    email: rowData.email,
                    DOB: rowData.DOB,
                    DOA: rowData.DOA,
                    route: list2,
                    areas: rowData.address,
                    status: rowData.status,
                  };
                  list.push(u_data);
                  list2 = [];
                })(party_data[i]);
                counInfo++;
                if (counInfo == party_data.length) {
                  let c = Math.ceil(count.length / limit);
                  if (c == 0) {
                    c += 1;
                  }
                  res.json({
                    status: true,
                    message: "Parties for this state found successfully",
                    result: list,
                    pageLength: c,
                    count: count.length
                  });
                }
              }
            }
          }
        }
      } else {
        res.json({
          status: true,
          message: "No party found",
          result: [],
        });
      }
    });
  } else if (employee_id != "") {
    let mapped_party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
    if (mapped_party_data.length < 1) {
      return res.json({ status: false, message: "No parties found", result: [] })
    } else {
      let list = []
      for (let i = 0; i < mapped_party_data.length; i++) {
        let party_data = await Party.findOne({ _id: mapped_party_data[i].assigned_to_id });
        let state_data = await Location.findOne({ id: party_data.state })
        let city_data = await Location.findOne({ id: party_data.city })
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
          firmName: party_data.firmName,
          partyType: party_type_data.party_type,
          pincode: party_data.pincode,
          partyid: `${party_data.company_code}${party_data.party_code}`,
          image: party_data.image,
          document: party_data.document || [],
          GSTNo: party_data.GSTNo,
          contactPersonName: party_data.contactPersonName,
          mobileNo: party_data.mobileNo,
          email: party_data.email,
          DOB: party_data.DOB,
          DOA: party_data.DOA,
          areas: party_data.address,
          status: party_data.status,
        };
        list.push(u_data);
      }
      return res.json({ status: true, message: "Data", result: list })
    }
  }
});

router.post("/unmapped_parties", async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  if (employee_id == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided",
      });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var page = req.body.page ? req.body.page : "1";
    var limit = 10;
    var count = await Party.find({ company_id });
    var list = [];
    var list2 = [];
    var state = req.body.state ? req.body.state : "";
    var partyType = req.body.partyType ? req.body.partyType : "";
    let obj1 = [];
    obj1.push({ is_delete: "0", is_mapped: false })
    if (company_id != "" && state == "" && partyType == "") {
      obj1.push({ company_id });
    } else if (company_id != "" && state != "" && partyType == "") {
      obj1.push({ company_id }, { state });
    } else if (company_id != "" && state == "" && partyType != "") {
      obj1.push({ company_id }, { partyType });
    } else if (company_id != "" && state != "" && partyType != "") {
      obj1.push({ company_id }, { state }, { partyType });
    }
    console.log('obj1-----------------------------------------------------------', obj1);
    Party.find({ $and: obj1 }).sort({ "status": -1 }).limit(limit * 1).skip((page - 1) * limit).exec().then(async (party_data) => {
      if (party_data.length > 0) {
        let counInfo = 0;
        for (let i = 0; i < party_data.length; i++) {
          var arr = party_data[i].route ? party_data[i].route[0].split(",") : "";
          if (arr == "") {
            await (async function (rowData) {
              var state_data = await Location.findOne({
                id: party_data[i].state,
              });
              var city_data = await Location.findOne({
                id: party_data[i].city,
              });
              // var district_data = await Location.findOne({
              //   _id: party_data[i].district,
              // });
              var party_type_data = await PartyType.findOne({
                _id: party_data[i].partyType,
              });
              var u_data = {
                id: rowData._id,
                state: { name: state_data.name, id: rowData.state },
                city: { name: city_data.name, id: rowData.city },
                // district: {
                //   name: district_data.name,
                //   id: rowData.district,
                // },
                firmName: rowData.firmName,
                partyType: party_type_data.party_type,
                partyid: `${rowData.company_code}${rowData.party_code}`,
                image: rowData.image,
                pincode: rowData.pincode,
                GSTNo: rowData.GSTNo,
                contactPersonName: rowData.contactPersonName,
                mobileNo: rowData.mobileNo,
                email: rowData.email,
                DOB: rowData.DOB,
                DOA: rowData.DOA,
                route: list2,
                areas: rowData.address,
                status: rowData.status,
              };
              list.push(u_data);
            })(party_data[i]);
            counInfo++;
            if (counInfo == party_data.length) {
              let c = Math.ceil(count.length / limit);
              console.log(count.length);
              console.log(c);
              if (c == 0) {
                c += 1;
              }
              res.json({
                status: true,
                message: "Parties for this state found successfully",
                result: list,
                pageLength: c,
              });
            }
          } else {
            console.log("inside else");
            for (let j = 0; j < arr.length; j++) {
              var state_data = await Location.findOne({
                id: party_data[i].state,
              });
              var city_data = await Location.findOne({
                id: party_data[i].city,
              });
              // var district_data = await Location.findOne({
              //   _id: party_data[i].district,
              // });
              var party_type_data = await PartyType.findOne({
                _id: party_data[i].partyType,
              });
              var route_data = await Route.findOne({ _id: arr[j] })
              let data = {
                route_name: route_data.route_name,
                id: route_data._id,
              };
              list2.push(data);
              if (arr.length == j + 1) {
                await (async function (rowData) {
                  var u_data = {
                    id: rowData._id,
                    state: {
                      name: state_data.name,
                      id: rowData.state,
                    },
                    city: {
                      name: city_data.name,
                      id: rowData.city,
                    },
                    // district: {
                    //   name: district_data.name,
                    //   id: rowData.district,
                    // },
                    firmName: rowData.firmName,
                    partyType: party_type_data.party_type,
                    pincode: rowData.pincode,
                    partyid: `${rowData.company_code}${rowData.party_code}`,
                    image: rowData.image,
                    GSTNo: rowData.GSTNo,
                    contactPersonName: rowData.contactPersonName,
                    mobileNo: rowData.mobileNo,
                    email: rowData.email,
                    DOB: rowData.DOB,
                    DOA: rowData.DOA,
                    route: list2,
                    areas: rowData.address,
                    status: rowData.status,
                  };
                  list.push(u_data);
                  list2 = [];
                })(party_data[i]);
                counInfo++;
                if (counInfo == party_data.length) {
                  let c = Math.ceil(count.length / limit);
                  if (c == 0) {
                    c += 1;
                  }
                  res.json({
                    status: true,
                    message: "Parties for this state found successfully",
                    result: list,
                    pageLength: c,
                  });
                }
              }
            }
          }
        }
      } else {
        res.json({
          status: true,
          message: "No party found",
          result: [],
        });
      }
    });
  } else if (employee_id != "") {
    let mapped_party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
    if (mapped_party_data.length < 1) {
      return res.json({ status: false, message: "No parties found", result: [] })
    } else {
      let list = []
      for (let i = 0; i < mapped_party_data.length; i++) {
        let party_data = await Party.findOne({ _id: mapped_party_data[i].assigned_to_id });
        let state_data = await Location.findOne({ id: party_data.state })
        let city_data = await Location.findOne({ id: party_data.city })
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
          firmName: party_data.firmName,
          partyType: party_type_data.party_type,
          pincode: party_data.pincode,
          partyid: `${party_data.company_code}${party_data.party_code}`,
          image: party_data.image,
          GSTNo: party_data.GSTNo,
          contactPersonName: party_data.contactPersonName,
          mobileNo: party_data.mobileNo,
          email: party_data.email,
          DOB: party_data.DOB,
          DOA: party_data.DOA,
          areas: party_data.address,
          status: party_data.status,
        };
        list.push(u_data);
      }
      return res.json({ status: true, message: "Data", result: list })
    }
  }
});

router.post("/getParty", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  var list = [];
  if (id != "") {
    Party.findOne({ _id: id }).exec().then((party_data) => {
      if (party_data) {
        Location.findOne({ id: party_data.state }).exec().then((state_data) => {
          Location.findOne({ id: party_data.city }).exec().then((city_data) => {
            // Location.findOne({ _id: party_data.district }).exec().then((district_data) => {
            PartyType.findOne({ _id: party_data.partyType }).exec().then((party_type_data) => {
              var arr = party_data.route ? party_data.route[0].split(",") : "";
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
                  partyid: `${party_data.company_code}${party_data.party_code}`,
                  address1: party_data.address1,
                  address2: party_data.address2,
                  document: party_data.document || [],
                  partyType: party_type_data.party_type,
                  image: party_data.image,
                  pincode: party_data.pincode,
                  GSTNo: party_data.GSTNo,
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
                          partyid: `${party_data.company_code}${party_data.party_code}`,
                          address1: party_data.address1,
                          address2: party_data.address2,
                          partyType: party_type_data.party_type,
                          image: party_data.image,
                          pincode: party_data.pincode,
                          document: party_data.document || [],
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
            })
            // });
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

router.post("/partyProfileImage", imageUpload.fields([{ name: "party_image" }]), (req, res) => {
  console.log(req.body);
  const id = req.body.id ? req.body.id : "";
  if (id != "") {
    Party.findOne({ _id: id })
      .exec()
      .then((user_data) => {
        if (user_data) {
          updated_party = {};
          if (req.files.party_image) {
            updated_party.image = base_url + req.files.party_image[0].path;
          }
          Party.findOneAndUpdate(
            { _id: id },
            updated_party,
            { new: true },
            (err, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Updated Successfully",
                  result: updated_party,
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

router.delete("/deleteParty", async (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    let party_data = await Party.findOne({ _id: id });
    for (let i = 0; i < party_data.route.length; i++) {
      await Route.findByIdAndUpdate({ _id: party_data.route[i] }, { $set: { is_mapped: false } }, { new: true })
    }
    let party_gruping_data = await PartyGrouping.find({ party_id: id });
    for (let i = 0; i < party_gruping_data.length; i++) {
      await PartyGrouping.findOneAndUpdate({ party_id: id }, { $set: { is_delete: "1" } })
    }
    Party.findOneAndUpdate({ _id: id }, { $set: { is_delete: "1" } }).exec().then(() => {
      res.status(200).json({
        status: true,
        message: "Deleted successfully",
      });
    });
  }
});

router.post("/bulkImport", imageUpload.fields([{ name: "party_excel" }]), (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token must be provided", });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  var workbook = XLSX.readFile(req.files.party_excel[0].path);
  var sheet_namelist = workbook.SheetNames;
  var x = 0;
  var list = [];
  let countInfo = 0;
  sheet_namelist.forEach(async (element) => {
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
    for (let i = 0; i < xlData.length; i++) {
      var party_data2 = await Party.findById(xlData[i].ID).sort({ party_code: -1 });
      if (!party_data2) {
        var party_data = await Party.findOne({ company_id: company._id }).sort({ party_code: -1 });
        let party_code;
        if (party_data) {
          party_code = party_data.party_code + 1;
        } else {
          party_code = 1;
        }
        PartyType.findOne({ party_type: xlData[i].Party_Type }).exec().then((party_type_data) => {
          Location.findOne({ name: xlData[i].State }).exec().then((state_data) => {
            Location.findOne({ name: xlData[i].City }).exec().then((city_data) => {
              var new_party = new Party({
                partyType: party_type_data._id,
                firmName: xlData[i].Firm_Name,
                GSTNo: xlData[i].GST_No,
                route: "",
                image: xlData[i].Profile_Image,
                contactPersonName: xlData[i].Contact_Person_Name,
                mobileNo: xlData[i].Phone_Number,
                email: xlData[i].Email,
                company_id: company_id,
                pincode: xlData[i].Pincode,
                state: state_data.id,
                city: city_data.id,
                address1: xlData[i].Address_1,
                address2: xlData[i].Address_2,
                DOB: xlData[i].DOB,
                DOA: xlData[i].DOA,
                Created_date: get_current_date(),
                Updated_date: get_current_date(),
                status: xlData[i].Status,
              });
              new_party.save();
              list.push(new_party);
              countInfo++;
              if (countInfo == xlData.length) {
                res.status(200).json({
                  status: true,
                  message: `${list.length} Parties imported successfully.`,
                  result: list,
                  count: list.length,
                });
              }
            });
          });
        });
      } else {
        countInfo++;
        if (countInfo == xlData.length) {
          return res.status(200).json({
            status: true,
            message: `All Parties already exist.`,
            result: list,
            count: list.length,
          });
        }
      }
    }
    x++;
  });
}
);

router.delete('/deleteallparties', (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  Party.deleteMany({ company_id }).exec().then(() => {
    res.send({ status: true, message: "parties deleted successfully" })
  })
})
module.exports = router;
