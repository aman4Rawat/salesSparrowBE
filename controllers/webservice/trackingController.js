const express = require("express");
const mongoose = require("mongoose");
const { extractCompanyId } = require('../../middleware/response')
const Tracking = mongoose.model("Tracking");
const Employee = mongoose.model("Employee");
const Order = mongoose.model("Order");
const DeviceStatus = mongoose.model("DeviceStatus");
const Attendance = mongoose.model("Attendance");
const SalesReport = mongoose.model("SalesReport");
const ExpenseReport = mongoose.model("ExpenseReport");
const Retailer = mongoose.model("Retailer");
const Visit = mongoose.model("Visit");
const Beat = mongoose.model("Beat");
const Location = mongoose.model("Location");
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

router.post('/get_employees_current_location', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let emp_id = req.body.emp_id ? req.body.emp_id : "";
  if (emp_id == "") {
    let list = []
    let date = get_current_date().split(" ")[0]
    let emp_data = await Employee.find({ companyId: company_id })
    for (let i = 0; i < emp_data.length; i++) {
      let tracking_data = await Tracking.findOne({ emp_id: emp_data[i]._id, date: date });
      if (tracking_data) {
        let u_data = {
          emp_id: emp_data[i]._id,
          emp_name: emp_data[i].employeeName,
          emp_image: emp_data[i].image,
          emp_city: emp_data[i].headquarterCity,
          location: tracking_data.current_location,
        }
        list.push(u_data)
      } else {
        let u_data = {
          emp_id: emp_data[i]._id,
          emp_name: emp_data[i].employeeName,
          emp_image: emp_data[i].image,
          emp_city: emp_data[i].headquarterCity,
          location: {},
        }
        list.push(u_data)
      }
    }
    return res.json({ status: true, message: "Data", result: list })
  } else {
    let list = []
    let date1 = req.body.date ? req.body.date : "";
    if (date1 == "") {
      date1 = get_current_date().split(" ")[0]
    }
    let emp_data = await Employee.findOne({ _id: emp_id })
    let tracking_data = await Tracking.findOne({ emp_id: emp_data._id, date: date1 });
    if (tracking_data) {
      tracking_data.location = tracking_data.location.sort((a, b) => new Date(a["date"]).getTime() - new Date(b["date"]).getTime());
      let u_data = {
        emp_id: emp_data._id,
        emp_name: emp_data.employeeName,
        emp_image: emp_data.image,
        emp_city: emp_data.headquarterCity,
        location: tracking_data.location,
      }
      list.push(u_data)
    } else {
      let u_data = {
        emp_id: emp_data._id,
        emp_name: emp_data.employeeName,
        emp_image: emp_data.image,
        emp_city: emp_data.headquarterCity,
        location: [],
      }
      list.push(u_data)
    }

    return res.json({ status: true, message: "Data", result: list })
  }
})

router.get('/get_employees_path', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let list = []
  let date = get_current_date().split(" ")[0]
  let emp_data = await Employee.find({ companyId: company_id, is_delete: "0" })
  for (let i = 0; i < emp_data.length; i++) {
    let tracking_data = await Tracking.findOne({ emp_id: emp_data[i]._id, date: date });
    if (tracking_data) {
      let u_data = {
        emp_id: emp_data[i]._id,
        emp_name: emp_data[i].employeeName,
        emp_image: emp_data[i].image,
        emp_city: emp_data[i].headquarterCity,
        location: tracking_data.location,
      }
      list.push(u_data)
    } else {
      let u_data = {
        emp_id: emp_data[i]._id,
        emp_name: emp_data[i].employeeName,
        emp_image: emp_data[i].image,
        emp_city: emp_data[i].headquarterCity,
        location: [],
      }
      list.push(u_data)
    }
  }
  return res.json({ status: true, message: "Data", result: list })
})

router.get('/get_employees_device_status', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let list = []
  let date = get_current_date().split(" ")[0]
  let emp_data = await Employee.find({ companyId: company_id, is_delete: "0" })
  for (let i = 0; i < emp_data.length; i++) {
    let device_status_data = await DeviceStatus.findOne({ emp_id: emp_data[i]._id, date: date });
    if (device_status_data) {
      let headquarterState = await Location.findOne({ id: emp_data[i].headquarterState })
      let u_data = {
        emp_name: emp_data[i].employeeName,
        state: headquarterState.name,
        phone: emp_data[i].phone,
        gps: device_status_data.gps,
        internet: device_status_data.internet,
        battery: device_status_data.battery,
        androidVersion: device_status_data.androidVersion,
        mobileName: device_status_data.mobileName,
        appVersion: device_status_data.appVersion,
        updated_date: device_status_data.date2
      }
      list.push(u_data)
    } else {
      let headquarterState = await Location.findOne({ id: emp_data[i].headquarterState })
      let u_data = {
        emp_name: emp_data[i].employeeName,
        state: headquarterState.name,
        phone: emp_data[i].phone,
        gps: '',
        internet: '',
        battery: '',
        androidVersion: '',
        mobileName: '',
        appVersion: '',
        updated_date: ''
      }
      list.push(u_data)
    }
  }
  return res.json({ status: true, message: "Data", result: list })
})

router.post('/day_status', async (req, res) => {
  let emp_id = req.body.emp_id ? req.body.emp_id : "";
  let date = req.body.date ? req.body.date : "";
  if (date == "") {
    date = get_current_date().split(" ")[0]
  }
  // console.log('date-----',date)
  if (emp_id == "") return res.json({ status: false, message: "Please provide employee id" })
  let attendance_data = await Attendance.findOne({ date2: date, emp_id })
  // console.log('attendance_data-------',attendance_data)
  if (attendance_data) {
    let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
    let sales_report_data = await SalesReport.findOne({ employee_id: emp_id, sales_report_date: date })
    let expense_report_data = await ExpenseReport.findOne({ employee_id: emp_id, submit_date: date })
    let market_visit_data = await Visit.find({ emp_id, visit_date: date, visit_status: "Completed" })
    let list = []
    let total_order_amount = 0;
    let total_tc = 0;
    let total_pc = 0;
    if (market_visit_data.length > 0) {
      for (let i = 0; i < market_visit_data.length; i++) {
        let retailer_date = await Retailer.findOne({ _id: market_visit_data[i].retailer_id })
        console.log('market_visit_data[i].retailer_id', retailer_date._id);
        let order_data = await Order.findOne({ emp_id, retailer_id: market_visit_data[i].retailer_id, order_date: market_visit_data[i].visit_date })
        console.log('market_visit_data[i].visit_status-----', market_visit_data[i].order_status);
        if (market_visit_data[i].visit_status == "Completed") {
          total_tc += 1
        }
        if (order_data) {
          if (market_visit_data[i].order_status == "Productive") {
            total_pc += 1
            console.log('inside productive');
            total_order_amount += parseInt(order_data.total_amount);
            let data = {
              retailer_name: retailer_date.customerName,
              order_status: 'Secondary order',
              total_amount: order_data.total_amount,
              visit_date: market_visit_data[i].visit_date ?? '',
              visit_time: market_visit_data[i].visit_time ?? '',
            }
            list.push(data)
          }
        } else {
          let data = {
            retailer_name: retailer_date.customerName,
            order_status: 'Non-productive',
            total_amount: 'NA',
            visit_date: market_visit_data[i].visit_date ?? '',
            visit_time: market_visit_data[i].visit_time ?? '',
          }
          list.push(data)
        }
      }
    }
    console.log('list--------', list);
    let u_data = {
      started_time: attendance_data.date,
      beat_name: beat_data.beatName,
      sales_report_data: { type: "sales_report_data", data: sales_report_data ? sales_report_data : "NA" },
      expense_report_data: { type: "expense_report_data", data: expense_report_data ? expense_report_data : "NA" },
      market_visit_data: { type: "market_visit_data", data: list },
      day_starts: {
        total_distance: { device_kms: 0, submitted_kms: expense_report_data ? parseInt(expense_report_data.travelled_distance) : 0 },
        primary_performance: { order_count: sales_report_data ? parseInt(sales_report_data.pc) : 0, order_amount: sales_report_data ? parseInt(sales_report_data.sales_amount) : 0 },
        sales_amount: { market_visits: total_order_amount, submitted_reports: sales_report_data ? parseInt(sales_report_data.sales_amount) : 0 },
        sales_performance: {
          market_visits: { tc: total_tc, pc: total_pc },
          submitted_reports: { tc: sales_report_data ? parseInt(sales_report_data.tc) : 0, pc: sales_report_data ? parseInt(sales_report_data.pc) : 0 }
        }
      }
    }
    return res.json({ status: true, message: "Day status", result: u_data })
  } else {
    let u_data = {
      started_time: "NA",
      beat_name: "NA",
      sales_report_data: { type: "sales_report_data", data: "NA" },
      expense_report_data: { type: "expense_report_data", data: "NA" },
      market_visit_data: { type: "market_visit_data", data: [] },
    }
    return res.json({ status: true, message: "Day status", result: u_data })
  }

})

//-------------------------For getting location name from lat , long--------------------------------------

// const NodeGeocoder = require('node-geocoder');

// const options = {
//   provider: 'openstreetmap'
// };

// const geocoder = NodeGeocoder(options);

// const lat = 37.7749;
// const lng = -122.4194;

// geocoder.reverse({ lat, lng })
//   .then((res) => {
//     console.log(res[0].formattedAddress);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

router.post('/employee_tracking_report', async (req, res) => {
  // const company_id = req.company_id;
  let emp_id = req.body.emp_id ? req.body.emp_id : "";
  if (emp_id == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    const decodedToken = jwt.verify(token, "test");
    const company_id = decodedToken.user_id;
    let page = req.body.page ? req.body.page : "1";
    let search = req.body.search ? req.body.search : "";
    let condition = { companyId: company_id, is_delete: "0" }
    if (search != "") {
      var regex = new RegExp(search, 'i');
      condition.employeeName = regex;
    }
    let limit = 10
    let date = get_current_date().split(" ")[0];
    let emp_data = await Employee.find(condition);
    if (emp_data.length < 1) return res.json({ status: false, message: "No employee found" })
    let list = []
    let total_distance_travelled = 0;
    for (let j = 0; j < emp_data.length; j++) {
      let attendance_data = await Attendance.findOne({ emp_id: emp_data[j]._id, date2: date }).limit(limit * 1).skip((page - 1) * limit);
      if (attendance_data) {
        let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
        let expense_report_data = await ExpenseReport.findOne({ employee_id: emp_id, for_what_date: attendance_data.date2 })
        if (expense_report_data) {
          total_distance_travelled += parseInt(expense_report_data.travelled_distance);
        }
        let u_data = {
          employee: { name: emp_data[j].employeeName, id: emp_data[j]._id },
          beat: { name: beat_data.beatName, id: beat_data._id },
          date: attendance_data.date2,
          distance_travelled: expense_report_data ? Number(expense_report_data.travelled_distance) : 0,
        }
        list.push(u_data)
        // return res.json({status:true,message:"Data",result:list,pageLength:Math.ceil(emp_data.length/limit),total_distance_travelled:total_distance_travelled,})
      } else {
        let u_data = {
          employee: { name: emp_data[j].employeeName, id: emp_data[j]._id },
          beat: { name: "".beatName, id: "" },
          date: "",
          distance_travelled: 0,
        }
        list.push(u_data)
      }
    }
    return res.json({ status: true, message: "Data", result: list, pageLength: Math.ceil(emp_data.length / limit), total_distance_travelled: total_distance_travelled, })
  } else {

    let start_date = req.body.start_date ? req.body.start_date : "";
    let page = req.body.page ? req.body.page : "1";
    let limit = 10
    let end_date = req.body.end_date ? req.body.end_date : "";
    let x = new Date(start_date)
    let y = new Date(end_date)
    if (x > y) {
      return res.json({ status: false, message: "Please select a proper date" })
    }
    let date = get_current_date().split(" ")[0];
    let emp_data = await Employee.findOne({ _id: emp_id })
    let condition = {}
    condition.emp_id = emp_id;
    if (start_date != "" && end_date == "") {
      condition.date2 = { $gte: start_date, $lte: date }
    } else if (start_date != "" && end_date != "") {
      condition.date2 = { $gte: start_date, $lte: end_date }
    } else if (start_date == "" && end_date != "") {
      condition.date2 = { $lte: end_date }
    }
    console.log(condition);
    let attendance_data = await Attendance.find(condition).limit(limit * 1).skip((page - 1) * limit);
    let count = await Attendance.find(condition);
    if (attendance_data.length < 1) return res.json({ status: true, message: "No data" });
    let list = []
    let total_distance_travelled = 0;
    for (let i = 0; i < attendance_data.length; i++) {
      let beat_data = await Beat.findOne({ _id: attendance_data[i].beat_id })
      let expense_report_data = await ExpenseReport.findOne({ employee_id: emp_id, for_what_date: attendance_data[i].date2 })
      if (expense_report_data) {
        total_distance_travelled += parseInt(expense_report_data.travelled_distance);
      }
      let u_data = {
        employee: { name: emp_data.employeeName, id: emp_data._id },
        beat: { name: beat_data.beatName, id: beat_data._id },
        date: attendance_data[i].date2,
        distance_travelled: expense_report_data ? parseInt(expense_report_data.travelled_distance) : 0,
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Data", result: list, pageLength: Math.ceil(count.length / limit), total_days: count.length, total_distance_travelled: total_distance_travelled, })
  }
})

router.post('/reset_all_devices', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var companyId = decodedToken.user_id;
  await Employee.updateMany({ companyId, is_delete: "0" }, { $set: { device_id: "", deviceToken: "", is_login: false } });
  return res.json({ status: true })
})


module.exports = router;