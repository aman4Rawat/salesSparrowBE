const express = require("express");
const mongoose = require("mongoose");
const Tracking = mongoose.model("Tracking");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const Check = mongoose.model("Check");
const Role = mongoose.model("role");
const Attendance = mongoose.model("Attendance");
const DeviceStatus = mongoose.model("DeviceStatus");
const {extractEmployeeId} = require('../../middleware/response')
const router = express.Router();
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

router.post('/add_current_location',async (req,res)=>{
    const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0]
  let emp_data = await Employee.findOne({_id:employee_id})
  if(!emp_data) return res.json({status:false,message:"No such employee exist",result:[]})
  let location = req.body.location?req.body.location:{};
  if(location == {}) return res.json({status:false,message:"Please provide location",result:[]})
  let tracking_data = await Tracking.findOne({emp_id:employee_id,date:date})
  if(!tracking_data){
    var new_location =await Tracking.create({
        emp_id:employee_id,
        location:location,
        current_location:location,
        company_id:emp_data.companyId,
        date:date,
        Created_date:get_current_date(),
        status:"Active"
      })
  }else{
    var new_location_arr = tracking_data.location
    new_location_arr.push(location)
    await Tracking.findOneAndUpdate({emp_id:employee_id,date},{$set:{location:new_location_arr,current_location:location,updated_date:new Date()}})
  }
  return res.json({status:true,data:new_location||new_location_arr})
})

router.post('/add_current_location_offline',async (req,res)=>{
  const authHeader = req.headers["authorization"];
const token = authHeader && authHeader.split(" ")[1];
if (!token) return res.json({ status: false, message: "Token is required" });
let x = token.split(".");
if (x.length < 3)
  return res.send({ status: false, message: "Invalid token" });
var decodedToken = jwt.verify(token, "test");
var employee_id = decodedToken.user_id;
let date = get_current_date().split(" ")[0]
let emp_data = await Employee.findOne({_id:employee_id})
if(!emp_data) return res.json({status:false,message:"No such employee exist",result:[]})
let location = req.body.location?req.body.location:[];
if(location == []) return res.json({status:false,message:"Please provide location",result:[]})
let tracking_data = await Tracking.findOne({emp_id:employee_id,date:date})
  if (!tracking_data) {
    for (let i = 0; i < location.length; i++) {
      if (i == 0) {
        var new_location = await Tracking.create({
          emp_id: employee_id,
          location: location[i],
          current_location: location,
          company_id: emp_data.companyId,
          date: date,
          Created_date: get_current_date(),
          status: "Active"
        })
      } else {
        var new_location_arr = new_location.location
        new_location_arr.push(location[i]);
        await Tracking.findOneAndUpdate({ emp_id: employee_id, date }, { $set: { location: new_location_arr, current_location: location[i], updated_date: new Date() } })
      }
    }
  } else {
    var new_location_arr = [...tracking_data.location,...location]
    await Tracking.findOneAndUpdate({ emp_id: employee_id, date }, { $set: { location: new_location_arr, current_location: location[-1], updated_date: new Date() } })
  }
return res.json({status:true,data:new_location||new_location_arr})
})

router.post('/add_device_status',async (req,res)=>{
  // console.log('body-------------------',req.body)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0]
  let emp_data = await Employee.findOne({_id:employee_id})
  if(!emp_data) return res.json({status:false,message:"No such employee exist",result:[]})
  let gps = req.body.gps?req.body.gps:""
  let internet = req.body.internet?req.body.internet:""
  let battery = req.body.battery?req.body.battery:""
  let mobileName = req.body.mobileName?req.body.mobileName:""
  let appVersion = req.body.app_version?req.body.app_version:""
  let androidVersion = req.body.android_version?req.body.android_version:""
  let device_status_data = await DeviceStatus.findOne({emp_id:employee_id,date:date})
  if(!device_status_data){
    let assigned_state_data = await Location.findOne({id:emp_data.headquarterState})
    let new_device_status =await DeviceStatus.create({
      emp_id:employee_id,
      company_id:emp_data.companyId,
      gps:gps,
      internet:internet,
      battery:battery,
      emp_name:emp_data.employeeName,
      assigned_state_id:emp_data.headquarterState,
      assigned_state:assigned_state_data.name,
      mobile:emp_data.phone,
      mobileName:mobileName,
      androidVersion:androidVersion,
      appVersion:appVersion,
      date:date,
      date2:new Date(),
      Created_date:get_current_date(),
      Updated_date:get_current_date(),
      status:"Active",
    })
  }else{
    await DeviceStatus.findOneAndUpdate({emp_id:employee_id,date:date},{$set:{gps,battery,internet,date2:new Date(),mobileName,appVersion,androidVersion}})
  }
  return res.json({status:true})
})

router.post('/get_employees_current_location', async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  if (employee_id == "") {
    // console.log('inside if')
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3)
      return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var emp_id = decodedToken.user_id;
    let employee_data = await Employee.findOne({ _id: emp_id })
    var company_id = employee_data.companyId;
    let list = []
    let date = get_current_date().split(" ")[0]
    // console.log('employee_data------',employee_data)
    Role.findOne({ _id: employee_data.roleId }).exec().then(async (role_data) => {
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
        if (r_data.hierarchy_level > hierarchy_level) {
          role_id_array.push(r_data._id);
        }
      });
      Employee.find({$and:[{roleId:{$in:role_id_array}},{companyId:company_id},{is_delete:"0"}]}).exec().then(async (emp_data) => {
        for (let i = 0; i < emp_data.length; i++) {
          let tracking_data = await Tracking.findOne({ emp_id: emp_data[i]._id, date: date });
          if (tracking_data) {
            let u_data = {
              emp_id: emp_data[i]._id,
              emp_name: emp_data[i].employeeName,
              emp_city: emp_data[i].headquarterCity,
              location: tracking_data.current_location,
              location_name: tracking_data.location_name,
              date: tracking_data.date,
              time: tracking_data.updated_date,
            }
            list.push(u_data)
          } else {
            let u_data = {
              emp_id: emp_data[i]._id,
              emp_name: emp_data[i].employeeName,
              emp_city: emp_data[i].headquarterCity,
              location: {},
              location_name: "",
              date: "",
              time: "",
            }
            list.push(u_data)
          }
        }
        return res.json({ status: true, message: "Data", result: list })
        });
    });
  } else {
    let date2 = req.body.date ? req.body.date : ""
    let date = get_current_date().split(" ")[0]
    let emp_data = await Employee.findOne({ _id: employee_id })
    condition = {}
    condition.emp_id = emp_data._id
    if (date2 != "") {
      condition.date = date2
    } else {
      condition.date = date
    }
    condition2 = {}
    condition2.emp_id = emp_data._id
    if (date2 != "") {
      condition2.check_in_date = date2
    } else {
      condition2.check_in_date = date
    }
    // console.log(condition)
    let list = []
    let tracking_data = await Tracking.findOne(condition);
    let check_in_data = await Check.findOne(condition2);
    let check_in_time = ''
    // console.log('check_in_data-----------------', check_in_data)
    if (check_in_data) {
      check_in_time = check_in_data.check_in_time
    }
    // console.log(tracking_data)
    if (tracking_data) {
      let u_data = {
        emp_id: emp_data._id,
        emp_name: emp_data.employeeName,
        emp_image: emp_data.image,
        emp_city: emp_data.headquarterCity,
        location: tracking_data.location,
        check_in_time: check_in_time,
      }
      list.push(u_data)
    } else {
      let u_data = {
        emp_id: emp_data._id,
        emp_name: emp_data.employeeName,
        emp_image: emp_data.image,
        emp_city: emp_data.headquarterCity,
        check_in_time: check_in_time,
        location: [],
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Data", result: list })
  }
});

// router.post('/listingPlaces',extractEmployeeId,async (req,res)=>{
//   const employee_id = req.employee_id;
//   let key = req.body.key  || "";
//   if(key == "") return res.json({status:false,message:"Please provide key"});
//   if(key == "to"){
//     let date = get_current_date().split(" ")[0];
//     let places = []
//     let tracking_data = await Tracking.findOne({emp_id:employee_id,date});
//     if(!tracking_data) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
//     if(tracking_data.location.length<1) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
//     for (const data of tracking_data.location) {
//       const lat = data.lat;
//       const lng = data.long;
//         const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
//         const data = res.data;
//         const displayName = data.display_name;
//       if (!places.includes(displayName)) {
//         places.push(displayName);
//       }
//     }
//     return res.json({status:true,message:'Data',result:places})
//   }else if(key == "from"){
//     let date = get_current_date().split(" ")[0];
//     let places = []
//     let tracking_data = await Tracking.findOne({emp_id:employee_id,date});
//     if(!tracking_data) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
//     if(tracking_data.location.length<1) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
//     let count = 0;
//     for (const data of tracking_data.location) {
//       count++;
//       if(count == 6){
//         return res.json({status:true,message:'Data',result:places})
//       }
//       const lat = data.lat;
//       const lng = data.long;
//         const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
//         const data = res.data;
//         const displayName = data.display_name;
//       if (!places.includes(displayName)) {
//         places.push(displayName);
//       }
//     }
//   }else{
//     return res.json({status:false,message:"Please check the key"})
//   }
// })

router.post('/listingPlaces', extractEmployeeId, async (req, res) => {
  const employee_id = req.employee_id;
  let key = req.body.key || "";
  let date = req.body.date || "";
  if (key == "") return res.json({ status: false, message: "Please provide key" });
  if (date == "") {
    if (key == "to") {
      // let date = get_current_date().split(" ")[0];
      // let places = []
      // let tracking_data = await Tracking.findOne({emp_id:employee_id,date});
      // if(!tracking_data) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
      // if(tracking_data.location.length<1) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
      // for (const data of tracking_data.location) {
      //   let x = data.name.split(", ").reverse()[0]
      //   if (places.length<1) {
      //     let x=  {
      //       lat:data.lat,
      //       long:data.long,
      //       name:data.name
      //     }
      //     places.push(x);
      //   }else {
      //     for(let i = 0;i<places.length;i++){
      //       // console.log(x)
      //       console.log(places[i].name.includes(x))
      //       if(!places[i].name.includes(x)){
      //         console.log('inside if')
      //         let x=  {
      //           lat:data.lat,
      //           long:data.long,
      //           name:data.name
      //         }
      //         places.push(x);
      //       }
      //     }
      //   }
      // }
      // return res.json({status:true,message:'Data',result:places})
      let date = get_current_date().split(" ")[0];
      let places = [];
      let tracking_data = await Tracking.findOne({ emp_id: employee_id, date });

      if (!tracking_data || tracking_data.location.length < 1) {
        let date = get_current_date().split(" ")[0];
        let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
        if (attendance_data) {
          var x = {
            lat: attendance_data.lat ? attendance_data.lat : "",
            long: attendance_data.long ? attendance_data.long : "",
            name: attendance_data.location[0]
          }
        }
        return res.json({ status: false, message: "Employee hasn't moved yet", result: [x] });
      }

      for (const data of tracking_data.location) {
        let x = data.name.split(", ").reverse()[0];
        let found = false;

        for (const place of places) {
          if (place.name.includes(x)) {
            found = true;
            break;
          }
        }

        if (!found) {
          places.push({
            lat: data.lat,
            long: data.long,
            name: data.name
          });
        }
      }

      return res.json({ status: true, message: 'Data', result: places });

    } else if (key == "from") {
      let date = get_current_date().split(" ")[0];
      let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
      if (attendance_data) {
        let x = {
          lat: attendance_data.lat ? attendance_data.lat : "",
          long: attendance_data.long ? attendance_data.long : "",
          name: attendance_data.location[0]
        }
        return res.json({ status: true, message: 'Data', result: [x] })
      } else {
        return res.json({ status: false, message: 'No Data', result: [] })
      }
    } else {
      return res.json({ status: false, message: "Please check the key" })
    }
  } else if (date != "") {
    if (key == "to") {
      // let places = []
      // let tracking_data = await Tracking.findOne({emp_id:employee_id,date});
      // if(!tracking_data) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
      // if(tracking_data.location.length<1) return res.json({status:false,message:"Employee haven't moved yet",result:[]});
      // console.log('tracking_data------------',tracking_data)
      // for (const data of tracking_data.location) {
      //   let x = data.name.split(", ").reverse()[0]
      //   // console.log('x-------------------',x)
      //   // console.log('places.includes(x)-------------------',places.name.includes(x));
      //   // places.push(x); 
      //   if (places.length<1) {
      //     let x=  {
      //       lat:data.lat,
      //       long:data.long,
      //       name:data.name
      //     }
      //     places.push(x);
      //   }else {
      //     for(let i = 0;i<places.length;i++){
      //       console.log(x)
      //       console.log(places[i].name.includes(x))
      //       if(!places[i].name.includes(x)){
      //         // console.log('inside if')
      //         let x=  {
      //           lat:data.lat,
      //           long:data.long,
      //           name:data.name
      //         }
      //         places.push(x);
      //       }
      //     }
      //   }
      // }
      // return res.json({status:true,message:'Data',result:places})
      let places = [];
      let tracking_data = await Tracking.findOne({ emp_id: employee_id, date });

      if (!tracking_data || tracking_data.location.length < 1) {
        // let date = get_current_date().split(" ")[0];
        let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
        if (attendance_data) {
          var x = {
            lat: attendance_data.lat ? attendance_data.lat : "",
            long: attendance_data.long ? attendance_data.long : "",
            name: attendance_data.location[0]
          }
        }
        return res.json({ status: false, message: "Employee hasn't moved yet", result: [x] });
      }

      for (const data of tracking_data.location) {
        let x = data.name.split(", ").reverse()[0];
        let found = false;

        for (const place of places) {
          if (place.name.includes(x)) {
            found = true;
            break;
          }
        }

        if (!found) {
          places.push({
            lat: data.lat,
            long: data.long,
            name: data.name
          });
        }
      }

      return res.json({ status: true, message: 'Data', result: places });

    } else if (key == "from") {
      let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
      if (attendance_data) {
        let x = {
          lat: attendance_data.lat ? attendance_data.lat : "",
          long: attendance_data.long ? attendance_data.long : "",
          name: attendance_data.location[0]
        }
        return res.json({ status: true, message: 'Data', result: [x] })
      } else {
        return res.json({ status: false, message: 'No Data', result: [] })
      }
    } else {
      return res.json({ status: false, message: "Please check the key" })
    }
  } else {
    return res.json({ status: false, message: "Please check the date" })
  }
})

module.exports = router;