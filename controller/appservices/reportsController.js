const express = require("express");
const mongoose = require("mongoose");
const SalesReport = mongoose.model("SalesReport");
const Employee = mongoose.model("Employee");
const ExpenseReport = mongoose.model("ExpenseReport");
const Admin = mongoose.model("AdminInfo");
const fs = require('fs')
const Visit = mongoose.model("Visit");
const PrimaryVisit = mongoose.model("PrimaryVisit");
const Mapping = mongoose.model("Mapping");
const Order = mongoose.model("Order");
const Attendance = mongoose.model("Attendance");
const Tracking = mongoose.model("Tracking");
const Retailer = mongoose.model("Retailer");
const Location = mongoose.model("Location");
const Role = mongoose.model("role");
const Beat = mongoose.model("Beat");
const Party = mongoose.model("Party");
const PrimaryOrder = mongoose.model("PrimaryOrder");
const ProductCatagory = mongoose.model("ProductCatagory");
const PrimaryOrderItem = mongoose.model("PrimaryOrderItem");
const VoucherGoodsReturn = mongoose.model("VoucherGoodsReturn");
const DetailedGoodsReturn = mongoose.model("DetailedGoodsReturn");
const PaymentCollection = mongoose.model("PaymentCollection");
const Invoice = mongoose.model("Invoice");
const Claim = mongoose.model("Claim");
const OrderItem = mongoose.model("OrderItem");
const EmployeeTarget = mongoose.model("EmployeeTarget");
const Stock = mongoose.model("Stock");
const PartyType = mongoose.model("PartyType");
const Product = mongoose.model("Product");
const Leave = mongoose.model("Leave");
const Check = mongoose.model("Check");
const router = express.Router();
const jwt = require("jsonwebtoken");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const PDFDocument = require('pdfkit');


const imageStorage = multer.diskStorage({
  destination: "images/expense_bill_img",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
}).single("expense_bill_img");


function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.get('/get_todays_sales', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0];
  console.log(date);
  let completd_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: date, visit_status: "Completed" })
  let productive_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: date, visit_status: "Completed", order_status: "Productive" })
  console.log(productive_market_visit_data.retailer_id);
  if (completd_market_visit_data.length < 1) return res.json({ status: true, message: "You haven't completed any visit", result: {} })
  let tc = completd_market_visit_data.length;
  let pc = productive_market_visit_data.length;
  let sale_amount = 0;
  for (let i = 0; i < productive_market_visit_data.length; i++) {
    let order_data = await Order.findOne({ $and: [{ retailer_id: productive_market_visit_data[i].retailer_id }, { order_date: date }], })
    console.log(order_data);
    sale_amount += parseInt(order_data.total_amount);
  }
  let data = {
    tc: tc,
    pc: pc,
    sale_amount: sale_amount
  }
  return res.json({ status: true, message: "data", result: data })

})

router.post('/create_sales_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id })
  let tc = req.body.tc ? req.body.tc : ""
  let pc = req.body.pc ? req.body.pc : ""
  let sales_amount = req.body.sales_amount ? req.body.sales_amount : ""
  let date = get_current_date().split(" ")[0];
  let sales_report_data = await SalesReport.findOne({ employee_id, sales_report_date: date });
  if (sales_report_data) {
    let updated_sales_report = await SalesReport.findByIdAndUpdate({ _id: sales_report_data._id }, { $set: { tc, pc, sales_amount } })
    return res.json({ status: true, message: "Sales report Updated successfully", result: updated_sales_report })
  } else {
    let new_sales_report = await SalesReport.create({
      tc: tc,
      pc: pc,
      sales_amount: sales_amount,
      employee_id: employee_id,
      company_id: emp_data.companyId,
      sales_report_date: date,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: "Active",
    })
    return res.json({ status: true, message: "Sales report submitted successfully", result: new_sales_report })
  }
})

router.post('/submit_expense_report', (req, res) => {
  imageUpload(req, res, async (err) => {
    console.log("file", req.file);
    console.log("body", req.body);
    let attachment = ``;
    if (req.file) {
      attachment = `${base_url}${req.file.path}`;
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({ _id: employee_id })
    let date = get_current_date().split(" ")[0];
    let previous_date = req.body.previous_date ? req.body.previous_date : "";
    if (previous_date == "") return res.json({ status: false, message: "Please give date" })
    let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: previous_date });
    if (!attendance_data) return res.json({ status: false, message: "You are offline that day" })
    let data = await ExpenseReport.findOne({ employee_id, for_what_date: previous_date })
    if (data) return res.json({ status: true, message: "Already submitted" })
    let ta_amount = req.body.ta_amount ? req.body.ta_amount : "";
    let travelled_distance = req.body.travelled_distance ? req.body.travelled_distance : "";
    let device_kms = req.body.device_kms ? req.body.device_kms : "";
    let da_amount = req.body.da_amount ? req.body.da_amount : "";
    let hotel = req.body.hotel ? req.body.hotel : "";
    let stationary = req.body.stationary ? req.body.stationary : "";
    let misc_amount = req.body.misc_amount ? req.body.misc_amount : "";
    let from_location = req.body.from_location ? req.body.from_location : "";
    let to_location = req.body.to_location ? req.body.to_location : "";
    let total_claim_amount = req.body.total_claim_amount ? req.body.total_claim_amount : "";
    if (ta_amount == "") return res.json({ status: false, message: "Please give TA" })
    if (da_amount == "") return res.json({ status: false, message: "Please give DA" })
    if (total_claim_amount == "") return res.json({ status: false, message: "Please give total amount" })
    let new_expense_report = await ExpenseReport.create({
      employee_id: employee_id,
      company_id: emp_data.companyId,
      ta_amount: ta_amount,
      da_amount: da_amount,
      from_location: from_location,
      to_location: to_location,
      submit_date: date,
      for_what_date: req.body.previous_date ? req.body.previous_date : date,
      travelled_distance: travelled_distance,
      device_kms: device_kms,
      stationary: stationary,
      hotel: hotel,
      misc_amount: misc_amount,
      total_claim_amount: total_claim_amount,
      attachment: attachment,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: "Active",
    })
    return res.json({ status: true, message: "Expense report submitted successfully", result: new_expense_report })
  })
})

router.post('/edit_status_expense_report', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  let approved_amount = req.body.approved_amount ? req.body.approved_amount : "";
  if (id == "") return res.json({ status: false, message: "Please give id" })
  if (approved_amount == "") return res.json({ status: false, message: "Please give approved_amount" })
  let approval_status = req.body.approval_status ? req.body.approval_status : "";
  if (approval_status == "") return res.json({ status: false, message: "Please give approval_status" })
  let data = await ExpenseReport.findOneAndUpdate({ _id: id }, { $set: { approval_status, approved_amount } })
  return res.json({ status: true, message: "Updated successfully" })
})

// router.post('/attendance_report', async (req, res) => {
//   let employee = req.body.employee ? req.body.employee : "";
//   if (employee == "") {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.json({ status: false, message: "Token is required" });
//     let x = token.split(".");
//     if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
//     var decodedToken = jwt.verify(token, "test");
//     var employee_id = decodedToken.user_id;
//     let arr = [{ emp_id: employee_id }];
//     let date = get_current_date().split(" ")[0]
//     let present_date = date.split("-")[2]
//     // let page = req.body.page?req.body.page:"1"
//     // let limit = 10;
//     let main = []
//     let start_date = req.body.start_date ? req.body.start_date : ""
//     let end_date = req.body.end_date ? req.body.end_date : ""
//     if (start_date != "" && end_date != "") arr.push({ date2: { $gte: start_date, $lte: end_date } })
//     if (start_date != "" && end_date == "") arr.push({ date2: { $gte: start_date } })
//     if (start_date == "" && end_date != "") arr.push({ date2: { $lte: end_date } })
//     let attendance_data = await Attendance.find({ $and: arr })
//     // console.log(attendance_data);
//     let y = 0;
//     let w = 0;
//     // var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
//     for (let i = parseInt(start_date.split("-")[2]); i <= Number(end_date.split("-")[2]); i++) {
//       let a = new Date(start_date).getDay();
//       if (a == 0) {
//         y++
//       }
//       w = new Date(start_date).getDate() + 1
//       // w = parseInt(start_date.split("-")[2])+1
//       let arr = start_date.split("-")
//       console.log("pehle_ki arr---", arr)
//       if (w > 9) {
//         arr[2] = `${w}`
//       } else {
//         arr[2] = `0${w}`
//         console.log("baad_ki arr---", arr)
//       }
//       start_date = arr.join("-")
//       console.log("w---", w)
//       console.log("start_date---", start_date)
//     }
//     console.log("y------", y)
//     // let attendance_data = await Attendance.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
//     // let count = await Attendance.find({$and:arr})
//     if (attendance_data.length > 0) {
//       let present = attendance_data.length;
//       let weekOff = 1;
//       let holidays = 4;
//       let leave = 0;
//       let leave_data = await Leave.find({ emp_id: employee_id ,date:{ $gte: start_date, $lte: end_date }})
//       leave = leave_data.length;
//       let abscent = parseInt(present_date) - present - y - leave;
//       let summary = {
//         present: present,
//         weekOff: y,
//         holidays: holidays,
//         leave: leave,
//         abscent: abscent,
//       }
//       for (let i = 0; i < attendance_data.length; i++) {
//         let beat_data = await Beat.findOne({ _id: attendance_data[i].beat_id });
//         let list = [];
//         let x = attendance_data[i].party_id_arr[0].split(",")
//         for (let i = 0; i < x.length; i++) {
//           let party_data = await Party.findOne({ _id: x[i] });
//           list.push(party_data.firmName)
//         }
//         let u_data = {
//           beat: beat_data.beatName,
//           party: list,
//           activity: attendance_data[i].activity_id,
//           date: attendance_data[i].date
//         }
//         main.push(u_data)
//       }
//       for (let i = 0; i < leave_data.length; i++) {
//         let u_data = {
//           beat: '',
//           party: [],
//           activity: '',
//           date: leave_data[i].date1
//         }
//         main.push(u_data)
//       }
//       const compareDates = (a, b) => {
//         const dateA = new Date(a.date);
//         const dateB = new Date(b.date);
//         return dateA - dateB;
//       };

//       main.sort(compareDates);
//       return res.json({ status: true, message: "Data", result: main, summary })
//     } else {
//       let present = 0;
//       let weekOff = 1;
//       let holidays = 4;
//       let leave = 0;
//       let leave_data = await Leave.find({ emp_id: employee_id })
//       leave = leave_data.length;
//       let abscent = parseInt(present_date) - present - weekOff - holidays - leave;
//       let summary = {
//         present: present,
//         weekOff: weekOff,
//         holidays: holidays,
//         leave: leave,
//         abscent: abscent,
//       }
//       return res.json({ status: true, message: "Data", result: main, summary })
//     }
//   } else if (employee != "") {
//     let employee_data = await Employee.findOne({ _id: employee });
//     if (!employee_data) return res.json({ status: false, message: "Please check employee id" })
//     let arr = [{ emp_id: employee }];
//     let date = get_current_date().split(" ")[0]
//     let present_date = date.split("-")[2]
//     // let page = req.body.page?req.body.page:"1"
//     // let limit = 10;
//     let main = []
//     let start_date = req.body.start_date ? req.body.start_date : ""
//     let end_date = req.body.end_date ? req.body.end_date : ""
//     if (start_date != "" && end_date != "") arr.push({ date2: { $gte: start_date, $lte: end_date } })
//     if (start_date != "" && end_date == "") arr.push({ date2: { $gte: start_date } })
//     if (start_date == "" && end_date != "") arr.push({ date2: { $lte: end_date } })
//     let attendance_data = await Attendance.find({ $and: arr })
//     console.log(attendance_data);
//     // let attendance_data = await Attendance.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
//     // let count = await Attendance.find({$and:arr})
//     if (attendance_data.length > 0) {
//       let present = attendance_data.length;
//       let weekOff = 1;
//       let holidays = 4;
//       let leave = 0;
//       let leave_data = await Leave.find({ emp_id: employee })
//       leave = leave_data.length;
//       let abscent = parseInt(present_date) - present - weekOff - holidays - leave;
//       let summary = {
//         present: present,
//         weekOff: weekOff,
//         holidays: holidays,
//         leave: leave,
//         abscent: abscent,
//       }
//       for (let i = 0; i < attendance_data.length; i++) {
//         let beat_data = await Beat.findOne({ _id: attendance_data[i].beat_id });
//         let list = [];
//         let x = attendance_data[i].party_id_arr[0].split(",")
//         for (let i = 0; i < x.length; i++) {
//           let party_data = await Party.findOne({ _id: x[i] });
//           list.push(party_data.firmName)
//         }
//         let u_data = {
//           beat: beat_data.beatName,
//           party: list,
//           activity: attendance_data[i].activity_id,
//           date: attendance_data[i].date
//         }
//         main.push(u_data)
//       }
//       return res.json({ status: true, message: "Data", result: main, summary })
//     } else {
//       let present = 0;
//       let weekOff = 1;
//       let holidays = 4;
//       let leave = 0;
//       let leave_data = await Leave.find({ emp_id: employee })
//       leave = leave_data.length;
//       let abscent = parseInt(present_date) - present - weekOff - holidays - leave;
//       let summary = {
//         present: present,
//         weekOff: weekOff,
//         holidays: holidays,
//         leave: leave,
//         abscent: abscent,
//       }
//       return res.json({ status: true, message: "Data", result: main, summary })
//     }
//   }

// })

router.post('/attendance_report', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  let date = get_current_date().split(" ")[0]
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let main = []
    let start_date = req.body.start_date ? req.body.start_date : ""
    let end_date = req.body.end_date ? req.body.end_date : ""
    if (start_date == "" && end_date == "") {
      start_date = `${date.split("-")[0]}-${date.split("-")[1]}-01`
      let y = new Date(date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (start_date != "" && end_date != "") {
      let y = new Date(end_date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (start_date != "" && end_date == "") {
      let y = new Date(date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    let y = 0;
    let w = 0;
    let present = 0;
    let abscent = 0;
    let leave = 0;
    let holidays = 0;
    for (let i = 0; i <= diffDays; i++) {
      let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: start_date })
      let leave_data = await Leave.findOne({ emp_id: employee_id, date: start_date })
      if (attendance_data) {
        present++
        let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
        let list = [];
        let x = attendance_data.party_id_arr[0].split(",")
        for (let i = 0; i < x.length; i++) {
          let party_data = await Party.findOne({ _id: x[i] });
          list.push(party_data.firmName)
        }
        let u_data = {
          beat: beat_data.beatName,
          party: list,
          activity: attendance_data.activity_id || "NA",
          date: start_date
        }
        main.push(u_data)
      } else if (leave_data) {
        leave++
        let u_data = {
          beat: 'leave',
          party: [],
          activity: '',
          date: start_date
        }
        main.push(u_data)
      } else {
        abscent++
        let u_data = {
          beat: 'absent',
          party: [],
          activity: '',
          date: start_date
        }
        main.push(u_data)
      }
      let x = new Date(start_date)
      x.setDate(x.getDate() + 1);
      let zz = new Date(x).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      let xx = zz.split("/")
      yy = xx.reverse()
      start_date = yy.join("-")
    }
    let summary = {
      present: present,
      weekOff: y,
      holidays: holidays,
      leave: leave,
      abscent: abscent,
    }
    return res.json({ status: true, message: "Data", result: main, summary })
  } else if (employee != "") {
    let employee_data = await Employee.findOne({ _id: employee });
    if (!employee_data) return res.json({ status: false, message: "Please check employee id" })
    let main = []
    let start_date = req.body.start_date ? req.body.start_date : ""
    let end_date = req.body.end_date ? req.body.end_date : ""
    if (start_date == "" && end_date == "") {
      start_date = `${date.split("-")[0]}-${date.split("-")[1]}-01`
      let y = new Date(date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (start_date != "" && end_date != "") {
      let y = new Date(end_date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (start_date != "" && end_date == "") {
      let y = new Date(date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    let y = 0;
    let w = 0;
    let present = 0;
    let abscent = 0;
    let leave = 0;
    let holidays = 0;
    for (let i = 0; i <= diffDays; i++) {
      let attendance_data = await Attendance.findOne({ emp_id: employee, date2: start_date })
      let leave_data = await Leave.findOne({ emp_id: employee, date: start_date })
      if (attendance_data) {
        present++
        let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
        let list = [];
        let x = attendance_data.party_id_arr[0].split(",")
        for (let i = 0; i < x.length; i++) {
          let party_data = await Party.findOne({ _id: x[i] });
          list.push(party_data.firmName)
        }
        let u_data = {
          beat: beat_data.beatName,
          party: list,
          activity: attendance_data.activity_id || "NA",
          date: start_date
        }
        main.push(u_data)
      } else if (leave_data) {
        leave++
        let u_data = {
          beat: 'leave',
          party: [],
          activity: '',
          date: start_date
        }
        main.push(u_data)
      } else {
        abscent++
        let u_data = {
          beat: 'absent',
          party: [],
          activity: '',
          date: start_date
        }
        main.push(u_data)
      }
      let x = new Date(start_date)
      x.setDate(x.getDate() + 1);
      let zz = new Date(x).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      let xx = zz.split("/")
      yy = xx.reverse()
      start_date = yy.join("-")
    }
    let summary = {
      present: present,
      weekOff: y,
      holidays: holidays,
      leave: leave,
      abscent: abscent,
    }
    return res.json({ status: true, message: "Data", result: main, summary })
  }

})

router.post('/secondary_sales_report', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let date = get_current_date().split(" ")[0]
    let arr = [{ employee_id }]
    // let page = req.body.page?req.body.page:"1"
    // let limit = 10;
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ sales_report_date: new RegExp(current_regexDate) })
    // let sales_report_data = await SalesReport.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
    let sales_report_data = await SalesReport.find({ $and: arr })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    let attendance_data = await Attendance.findOne({ date2: date, emp_id: employee_id })
    if (attendance_data) {
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
      let route_arr = beat_data.route;
      for (let i = 0; i < route_arr.length; i++) {
        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
        total_nc += new_retailer_data.length;
      }
    }
    for (let i = 0; i < sales_report_data.length; i++) {
      total_tc += parseInt(sales_report_data[i].tc)
      total_pc += parseInt(sales_report_data[i].pc)
      total_sale += parseInt(sales_report_data[i].sales_amount)
    }
    let summary = {
      total_tc: total_tc,
      total_pc: total_pc,
      total_sale: total_sale,
      total_nc: total_nc
    }
    // let count = await SalesReport.find({$and:arr})
    return res.json({ status: true, message: "Data", result: sales_report_data, summary })
  } else if (employee != "") {
    let date = get_current_date().split(" ")[0]
    let arr = [{ employee_id: employee }]
    // let page = req.body.page?req.body.page:"1"
    // let limit = 10;
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ sales_report_date: new RegExp(current_regexDate) })
    // let sales_report_data = await SalesReport.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
    let sales_report_data = await SalesReport.find({ $and: arr })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    let attendance_data = await Attendance.findOne({ date2: date, emp_id: employee })
    if (attendance_data) {
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
      let route_arr = beat_data.route;
      for (let i = 0; i < route_arr.length; i++) {
        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
        total_nc += new_retailer_data.length;
      }
    }
    for (let i = 0; i < sales_report_data.length; i++) {
      total_tc += parseInt(sales_report_data[i].tc)
      total_pc += parseInt(sales_report_data[i].pc)
      total_sale += parseInt(sales_report_data[i].sales_amount)
    }
    let summary = {
      total_tc: total_tc,
      total_pc: total_pc,
      total_sale: total_sale,
      total_nc: total_nc
    }
    // let count = await SalesReport.find({$and:arr})
    return res.json({ status: true, message: "Data", result: sales_report_data, summary })
  }
})

router.post('/market_visit_reports', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let arr = { emp_id: employee_id, visit_status: "Completed" }
    let month = req.body.month ? req.body.month : ""
    let date = get_current_date().split(" ")[0]
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.visit_date = new RegExp(current_regexDate)
    let market_visit_data = await Visit.find(arr).sort({ visit_date: -1 })
    if (market_visit_data.length < 1) return res.json({ status: false, message: "No Data" })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    let attendance_data = await Attendance.findOne({ date2: new RegExp(current_regexDate), emp_id: employee_id });
    if (attendance_data) {
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
      let route_arr = beat_data.route;
      for (let i = 0; i < route_arr.length; i++) {
        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
        total_nc += new_retailer_data.length;
      }
    }
    let list = []
    for (let i = 0; i < market_visit_data.length; i++) {
      let tc = 0
      let pc = 0
      let sales_amount = 0
      if (market_visit_data[i].visit_status == "Completed") {
        tc += 1
        total_tc += 1
        if (market_visit_data[i].order_status == "Productive") {
          pc += 1
          total_pc += 1
          let order_data = await Order.find({ emp_id: employee_id, order_date: market_visit_data[i].visit_date, retailer_id: market_visit_data[i].retailer_id });
          if (order_data.length > 0) {
            for (let j = 0; j < order_data.length; j++) {
              sales_amount += parseInt(order_data[j].total_amount);
              total_sale += parseInt(order_data[j].total_amount);
            }
          }
        }
      }
      let beat_data = await Beat.findOne({ _id: market_visit_data[i].beat_id })
      var u_data = {
        date: market_visit_data[i].visit_date,
        beat: beat_data.beatName,
        tc: tc,
        pc: pc,
        sales: sales_amount,
      }
      list.push(u_data)
    }
    let summary = {
      total_tc: total_tc,
      total_pc: total_pc,
      total_sale: total_sale,
      total_nc: total_nc
    }
    return res.json({ status: true, message: "Data", result: list, summary })
  } else if (employee != "") {
    let arr = { employee_id: employee }
    let month = req.body.month ? req.body.month : ""
    let date = get_current_date().split(" ")[0]
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.visit_date = new RegExp(current_regexDate)
    let market_visit_data = await Visit.find(arr).sort({ visit_date: -1 })
    if (market_visit_data.length < 1) return res.json({ status: false, message: "No Data" })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    let attendance_data = await Attendance.findOne({ date2: date, emp_id: employee })
    if (attendance_data) {
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
      let route_arr = beat_data.route;
      for (let i = 0; i < route_arr.length; i++) {
        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
        total_nc += new_retailer_data.length;
      }
    }
    let list = []
    for (let i = 0; i < market_visit_data.length; i++) {
      let tc = 0
      let pc = 0
      let sales_amount = 0
      if (market_visit_data[i].visit_status == "Completed") {
        tc += 1
        total_tc += 1
        if (market_visit_data[i].order_status == "Productive") {
          pc += 1
          total_pc += 1
          let order_data = await Order.find({ emp_id: employee, order_date: market_visit_data[i].visit_date });
          if (order_data.length > 0) {
            for (let j = 0; j < order_data.length; j++) {
              sales_amount += parseInt(order_data[j].total_amount);
              total_sale += parseInt(order_data[j].total_amount);
            }
          }
        }
      }
      let beat_data = await Beat.findOne({ _id: market_visit_data[i].beat_id })
      var u_data = {
        date: market_visit_data[i].visit_date,
        beat: beat_data.beatName,
        tc: tc,
        pc: pc,
        sales: sales_amount,
      }
      list.push(u_data)
    }
    let summary = {
      total_tc: total_tc,
      total_pc: total_pc,
      total_sale: total_sale,
      total_nc: total_nc
    }
    // let count = await SalesReport.find({$and:arr})
    return res.json({ status: true, message: "Data", result: list, summary })
  }
})

router.post('/expense_report', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let arr = [{ employee_id }]
    // let page = req.body.page?req.body.page:"1"
    // let limit = 10;
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ submit_date: new RegExp(current_regexDate) })
    // let sales_report_data = await SalesReport.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
    let expense_report_data = await ExpenseReport.find({ $and: arr })
    let total_claim = 0;
    let total_approved_claim = 0;
    total_claim += expense_report_data.reduce((sum, data) => sum + parseInt(data.total_claim_amount), 0)
    for (let i = 0; i < expense_report_data.length; i++) {
      if (expense_report_data[i].approved_amount != "") {
        total_approved_claim += parseInt(expense_report_data[i].approved_amount)
      }
    }
    let summary = {
      total_claim: total_claim,
      total_approved_claim: total_approved_claim,
    }
    console.log(summary);
    // let count = await SalesReport.find({$and:arr})
    return res.json({ status: true, message: "Data", result: expense_report_data, summary })
  } else if (employee != "") {
    let arr = [{ employee_id: employee }]
    // let page = req.body.page?req.body.page:"1"
    // let limit = 10;
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ submit_date: new RegExp(current_regexDate) })
    // let sales_report_data = await SalesReport.find({$and:arr}).limit(limit*1).skip((page-1)*limit)
    let expense_report_data = await ExpenseReport.find({ $and: arr })
    let total_claim = 0;
    let total_approved_claim = 0;
    total_claim += expense_report_data.reduce((sum, data) => sum + parseInt(data.total_claim_amount), 0)
    for (let i = 0; i < expense_report_data.length; i++) {
      if (expense_report_data[i].approved_amount != "") {
        total_approved_claim += parseInt(expense_report_data[i].approved_amount)
      }
    }
    let summary = {
      total_claim: total_claim,
      total_approved_claim: total_approved_claim,
    }
    // let count = await SalesReport.find({$and:arr})
    return res.json({ status: true, message: "Data", result: expense_report_data, summary })
  }
})

router.post('/primary_order_reports', async (req, res) => {
  console.log("primary_order_reports req.body --------------------------------------->", req.body)
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let status = req.body.status ? req.body.status : "";
    let arr = [{ emp_id: employee_id }]
    let list = []
    if (status == "Total") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      arr.push({ delivery_status: "Delivered" })
      let delivered_primary_order_data = await PrimaryOrder.find({ $and: arr });
      arr.pop()
      arr.push({ delivery_status: "Pending" })
      let pending_primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_order = primary_order_data.length;
      let total_order_value = 0;
      let total_delivered_order_value = 0;
      let total_delivered_orders = 0
      let total_pending_orders = 0
      let total_pending_order_value = 0
      if (delivered_primary_order_data.length > 0) {
        total_delivered_orders = delivered_primary_order_data.length;
        for (let i = 0; i < delivered_primary_order_data.length; i++) {
          total_delivered_order_value += parseInt(delivered_primary_order_data[i].total_amount)
        }
      }
      if (pending_primary_order_data.length > 0) {
        total_pending_orders = pending_primary_order_data.length;
        for (let i = 0; i < pending_primary_order_data.length; i++) {
          total_pending_order_value += parseInt(pending_primary_order_data[i].total_amount)
        }
      }
      for (let i = 0; i < primary_order_data.length; i++) {
        total_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
        let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data[i]._id })
        let item_list = []
        for (let i = 0; i < primary_order_item_data.length; i++) {
          let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id })
          let u_data = {
            product_id: primary_order_item_data[i].product_id,
            product_name: product_data.productName,
            product_price: primary_order_item_data[i].product_price,
            quantity: primary_order_item_data[i].quantity,
            sub_total_price: primary_order_item_data[i].sub_total_price,
          }
          item_list.push(u_data)
        }
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
          item: item_list
        }
        list.push(u_data)
      }
      let summary = {
        total_order: total_order,
        total_order_value: total_order_value,
        total_delivered_order_value: total_delivered_order_value,
        total_delivered_orders: total_delivered_orders,
        total_pending_orders: total_pending_orders,
        total_pending_order_value: total_pending_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else if (status == "Pending") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      arr.push({ approval_status: "Pending" })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_pending_order = primary_order_data.length;
      let total_pending_order_value = 0;
      for (let i = 0; i < primary_order_data.length; i++) {
        total_pending_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
        }
        list.push(u_data)
      }
      let summary = {
        total_pending_orders: total_pending_order,
        total_pending_order_value: total_pending_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else if (status == "Delivered") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      arr.push({ delivery_status: "Delivered" }, { approval_status: "Approved" })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_delivered_order = primary_order_data.length;
      let total_delivered_order_value = 0;
      for (let i = 0; i < primary_order_data.length; i++) {
        total_delivered_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
        }
        list.push(u_data)
      }
      let summary = {
        total_delivered_orders: total_delivered_order,
        total_delivered_order_value: total_delivered_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else {
      return res.json({ status: true, message: "Please give status" })
    }
  } else if (employee != "") {
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let status = req.body.status ? req.body.status : "";
    let arr = [{ emp_id: employee }]
    let list = []
    if (status == "Total") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      arr.push({ delivery_status: "Delivered" })
      let delivered_primary_order_data = await PrimaryOrder.find({ $and: arr });
      arr.pop()
      arr.push({ delivery_status: "Pending" })
      let pending_primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_order = primary_order_data.length;
      let total_order_value = 0;
      let total_delivered_order_value = 0;
      let total_delivered_orders = 0
      let total_pending_orders = 0
      let total_pending_order_value = 0
      if (delivered_primary_order_data.length > 0) {
        total_delivered_orders = delivered_primary_order_data.length;
        for (let i = 0; i < delivered_primary_order_data.length; i++) {
          total_delivered_order_value += parseInt(delivered_primary_order_data[i].total_amount)
        }
      }
      if (pending_primary_order_data.length > 0) {
        total_pending_orders = pending_primary_order_data.length;
        for (let i = 0; i < pending_primary_order_data.length; i++) {
          total_pending_order_value += parseInt(pending_primary_order_data[i].total_amount)
        }
      }
      for (let i = 0; i < primary_order_data.length; i++) {
        total_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id });
        let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data[i]._id })
        let item_list = []
        for (let i = 0; i < primary_order_item_data.length; i++) {
          let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id })
          let u_data = {
            product_id: primary_order_item_data[i].product_id,
            product_name: product_data.productName,
            product_price: primary_order_item_data[i].product_price,
            quantity: primary_order_item_data[i].quantity,
            sub_total_price: primary_order_item_data[i].sub_total_price,
          }
          item_list.push(u_data)
        }
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
          item: item_list
        }
        list.push(u_data)
      }
      let summary = {
        total_order: total_order,
        total_order_value: total_order_value,
        total_delivered_order_value: total_delivered_order_value,
        total_delivered_orders: total_delivered_orders,
        total_pending_orders: total_pending_orders,
        total_pending_order_value: total_pending_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else if (status == "Pending") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      arr.push({ approval_status: "Pending" })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_pending_order = primary_order_data.length;
      let total_pending_order_value = 0;
      for (let i = 0; i < primary_order_data.length; i++) {
        total_pending_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
        }
        list.push(u_data)
      }
      let summary = {
        total_pending_orders: total_pending_order,
        total_pending_order_value: total_pending_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else if (status == "Delivered") {
      let current_regexDate = `${year}-${month}-?[0-9]*`
      if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
      arr.push({ delivery_status: "Delivered" }, { approval_status: "Approved" })
      let primary_order_data = await PrimaryOrder.find({ $and: arr });
      let total_delivered_order = primary_order_data.length;
      let total_delivered_order_value = 0;
      for (let i = 0; i < primary_order_data.length; i++) {
        total_delivered_order_value += parseInt(primary_order_data[i].total_amount)
        let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
        let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
        let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
        let u_data = {
          order_id: primary_order_data[i]._id,
          emp: employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          approval_status: primary_order_data[i].approval_status,
        }
        list.push(u_data)
      }
      let summary = {
        total_delivered_orders: total_delivered_order,
        total_delivered_order_value: total_delivered_order_value,
      }
      return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
    } else {
      return res.json({ status: true, message: "Please give status" })
    }
  }
})

router.post('/primary_sale_reports', async (req, res) => {
  console.log("primary_sale_reports req.body --------------------------------------->", req.body)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let month = req.body.month ? req.body.month : "";
  let year = req.body.year ? req.body.year : "";
  let status = req.body.status ? req.body.status : "";
  let arr = [{ emp_id: employee_id }]
  let list = []
  if (status == "Total") {
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ date: new RegExp(current_regexDate) })
    let primary_order_data = await PrimaryOrder.find({ $and: arr });
    arr.push({ delivery_status: "Delivered" })
    let delivered_primary_order_data = await PrimaryOrder.find({ $and: arr });
    let pending_primary_order_data = await PrimaryOrder.find({ $and: arr });
    let total_order = primary_order_data.length;
    let total_order_value = 0;
    let total_delivered_order_value = 0;
    let total_delivered_orders = 0
    let total_pending_orders = 0
    let total_pending_order_value = 0
    if (delivered_primary_order_data.length > 0) {
      total_delivered_orders = delivered_primary_order_data.length;
      for (let i = 0; i < delivered_primary_order_data.length; i++) {
        total_delivered_order_value += parseInt(delivered_primary_order_data[i].total_amount)
      }
    }
    if (pending_primary_order_data.length > 0) {
      total_pending_orders = pending_primary_order_data.length;
      for (let i = 0; i < pending_primary_order_data.length; i++) {
        total_pending_order_value += parseInt(pending_primary_order_data[i].total_amount)
      }
    }
    for (let i = 0; i < primary_order_data.length; i++) {
      total_order_value += parseInt(primary_order_data[i].total_amount)
      let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
      let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
      let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id });
      let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data[i]._id })
      let item_list = []
      for (let i = 0; i < primary_order_item_data.length; i++) {
        let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id })
        let u_data = {
          product_id: primary_order_item_data[i].product_id,
          product_name: product_data.productName,
          product_price: primary_order_item_data[i].product_price,
          quantity: primary_order_item_data[i].quantity,
          sub_total_price: primary_order_item_data[i].sub_total_price,
        }
        item_list.push(u_data)
      }
      let u_data = {
        order_id: primary_order_data[i]._id,
        emp: employee_data.employeeName,
        party_type: party_type_data.party_type,
        order_date: primary_order_data[i].date,
        party: party_data.firmName,
        total_amount: primary_order_data[i].total_amount,
        approval_status: primary_order_data[i].approval_status,
        item: item_list
      }
      list.push(u_data)
    }
    let summary = {
      total_order: total_order,
      total_order_value: total_order_value,
      total_delivered_order_value: total_delivered_order_value,
      total_delivered_orders: total_delivered_orders,
      total_pending_orders: total_pending_orders,
      total_pending_order_value: total_pending_order_value,
    }
    return res.json({ status: true, message: "Primary orders", result: { list: list, summary: summary } })
  } else {
    return res.json({ status: true, message: "Please give status" })
  }
})

router.post('/primary_order_summary', async (req, res) => {
  let order_id = req.body.order_id ? req.body.order_id : "";
  let primary_order_data = await PrimaryOrder.findOne({ _id: order_id })
  if (!primary_order_data) return res.json({ status: false, message: "Check order id", result: [] })
  let party_data = await Party.findOne({ _id: primary_order_data.party_id })
  let party_type_data = await PartyType.findOne({ _id: primary_order_data.party_type_id })
  let data = {
    id: primary_order_data._id,
    party_type: party_type_data.party_type,
    party: party_data.firmName,
    party_address: party_data.address1,
    total_amount: primary_order_data.total_amount,
    approval_status: primary_order_data.approval_status,
    delivery_status: primary_order_data.delivery_status,
  }
  let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data._id })
  let list = []
  for (let i = 0; i < primary_order_item_data.length; i++) {
    let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id })
    let u_data = {
      product_id: primary_order_item_data[i].product_id,
      product_name: product_data.productName,
      product_price: primary_order_item_data[i].product_price,
      quantity: primary_order_item_data[i].quantity,
      sub_total_price: primary_order_item_data[i].sub_total_price,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Data", result: data, list })
})

router.post('/monthly_report', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let arr = [{ emp_id: employee_id }]
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ date2: new RegExp(current_regexDate) })
    let attandance_data = await Attendance.find({ $and: arr })
    let beat_ids = attandance_data.map(data => {
      return data.beat_id;
    })
    let dates = attandance_data.map(data => {
      return data.date2;
    })
    console.log(beat_ids);
    console.log(dates);
    let list = []
    let total_call = 0
    let productive_call = 0
    let total_km = 0
    let total_exp = 0
    let total_sale = 0
    for (let i = 0; i < dates.length; i++) {
      let beat_data = await Beat.findOne({ _id: attandance_data[i].beat_id })
      let expense_report_data = await ExpenseReport.findOne({ submit_date: dates[i] })
      let sales_report_data = await SalesReport.findOne({ sales_report_date: dates[i] })
      if (expense_report_data && sales_report_data) {
        total_call += parseInt(sales_report_data.tc)
        productive_call += parseInt(sales_report_data.pc)
        total_km += parseInt(expense_report_data.travelled_distance)
        total_exp += parseInt(expense_report_data.total_claim_amount)
        total_sale += parseInt(sales_report_data.sales_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beat_name,
          km: expense_report_data.travelled_distance,
          exp: expense_report_data.total_claim_amount,
          tc: sales_report_data.tc,
          pc: sales_report_data.pc,
          sale: sales_report_data.sales_amount,
        }
        list.push(u_data)
      } else if (!expense_report_data && sales_report_data) {
        total_call += parseInt(sales_report_data.tc)
        productive_call += parseInt(sales_report_data.pc)
        total_sale += parseInt(sales_report_data.sales_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beat_name,
          km: "NA",
          exp: "NA",
          tc: sales_report_data.tc,
          pc: sales_report_data.pc,
          sale: sales_report_data.sales_amount,
        }
        list.push(u_data)
      } else if (expense_report_data && !sales_report_data) {
        total_km += parseInt(expense_report_data.travelled_distance)
        total_exp += parseInt(expense_report_data.total_claim_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beat_name,
          km: expense_report_data.travelled_distance,
          exp: expense_report_data.total_claim_amount,
          tc: "NA",
          pc: "NA",
          sale: "NA",
        }
        list.push(u_data)
      } else if (!expense_report_data && !sales_report_data) {
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beat_name,
          km: "NA",
          exp: "NA",
          tc: "NA",
          pc: "NA",
          sale: "NA",
        }
        list.push(u_data)
      }
    }
    return res.json({ status: true, message: "Data", result: { list: list, tc: total_call, pc: productive_call, total_sale: total_sale, total_exp: total_exp, total_km: total_km } })
  } else if (employee != "") {
    let arr = [{ emp_id: employee }]
    let month = req.body.month ? req.body.month : ""
    let year = req.body.year ? req.body.year : ""
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ date2: new RegExp(current_regexDate) })
    let attandance_data = await Attendance.find({ $and: arr })
    let beat_ids = attandance_data.map(data => {
      return data.beat_id;
    })
    let dates = attandance_data.map(data => {
      return data.date2;
    })
    console.log(beat_ids);
    console.log(dates);
    let list = []
    let total_call = 0
    let productive_call = 0
    let total_km = 0
    let total_exp = 0
    let total_sale = 0
    for (let i = 0; i < dates.length; i++) {
      let beat_data = await Beat.findOne({ _id: attandance_data[i].beat_id })
      let expense_report_data = await ExpenseReport.findOne({ submit_date: dates[i] })
      let sales_report_data = await SalesReport.findOne({ sales_report_date: dates[i] })
      if (expense_report_data && sales_report_data) {
        total_call += parseInt(sales_report_data.tc)
        productive_call += parseInt(sales_report_data.pc)
        total_km += parseInt(expense_report_data.travelled_distance)
        total_exp += parseInt(expense_report_data.total_claim_amount)
        total_sale += parseInt(sales_report_data.sales_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beatName,
          km: expense_report_data.travelled_distance,
          exp: expense_report_data.total_claim_amount,
          tc: sales_report_data.tc,
          pc: sales_report_data.pc,
          sale: sales_report_data.sales_amount,
        }
        list.push(u_data)
      } else if (!expense_report_data && sales_report_data) {
        total_call += parseInt(sales_report_data.tc)
        productive_call += parseInt(sales_report_data.pc)
        total_sale += parseInt(sales_report_data.sales_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beatName,
          km: "NA",
          exp: "NA",
          tc: sales_report_data.tc,
          pc: sales_report_data.pc,
          sale: sales_report_data.sales_amount,
        }
        list.push(u_data)
      } else if (expense_report_data && !sales_report_data) {
        total_km += parseInt(expense_report_data.travelled_distance)
        total_exp += parseInt(expense_report_data.total_claim_amount)
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beatName,
          km: expense_report_data.travelled_distance,
          exp: expense_report_data.total_claim_amount,
          tc: "NA",
          pc: "NA",
          sale: "NA",
        }
        list.push(u_data)
      } else if (!expense_report_data && !sales_report_data) {
        let u_data = {
          date: attandance_data[i].date2,
          beat: beat_data.beatName,
          km: "NA",
          exp: "NA",
          tc: "NA",
          pc: "NA",
          sale: "NA",
        }
        list.push(u_data)
      }
    }
    return res.json({ status: true, message: "Data", result: { list: list, tc: total_call, pc: productive_call, total_sale: total_sale, total_exp: total_exp, total_km: total_km } })
  }
})

router.post('/secondary_order_reports', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let arr = [{ emp_id: employee_id }]
    let list = []
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ order_date: new RegExp(current_regexDate) })
    let order_data = await Order.find({ $and: arr });
    arr.push({ delivery_status: "Delivered" })
    let delivered_order_data = await Order.find({ $and: arr });
    console.log(order_data);
    let total_order = order_data.length;
    let total_delivered_order = delivered_order_data.length;
    let total_order_value = 0;
    let total_delivered_order_value = 0;
    for (let i = 0; i < delivered_order_data.length; i++) {
      total_delivered_order_value += parseInt(delivered_order_data[i].total_amount)
    }
    for (let i = 0; i < order_data.length; i++) {
      total_order_value += parseInt(order_data[i].total_amount)
      let employee_data = await Employee.findOne({ _id: order_data[i].emp_id })
      let retailer_data = await Retailer.findOne({ _id: order_data[i].retailer_id })
      let state_data = await Location.findOne({ id: employee_data.headquarterState })
      let visit_data = await Visit.findOne({ retailer_id: retailer_data._id, visit_date: order_data[i].order_date })
      let beat_data = await Beat.findOne({ _id: visit_data.beat_id })
      let order_item_data = await OrderItem.find({ order_id: order_data[i]._id })
      let order_item_list = []
      for (let i = 0; i < order_item_data.length; i++) {
        let product_data = await Product.findOne({ _id: order_item_data[i].product_id })
        let u_data = {
          product_id: order_item_data[i].product_id,
          product_name: product_data.productName,
          product_price: order_item_data[i].product_price,
          quantity: order_item_data[i].quantity,
          sub_total_price: order_item_data[i].sub_total_price,
        }
        order_item_list.push(u_data)
      }
      let u_data = {
        order_id: order_data[i]._id,
        delivery_status: order_data[i].delivery_status,
        beat_name: beat_data.beatName,
        emp: employee_data.employeeName,
        state: state_data.name,
        order_date: order_data[i].order_date,
        retailer: retailer_data.firmName,
        total_amount: order_data[i].total_amount,
        order_details: order_item_list,
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Secondary orders", result: { list: list, total_order: total_order, total_order_value: total_order_value, total_delivered_order: total_delivered_order, total_delivered_order_value: total_delivered_order_value } })
  } else {
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let arr = [{ emp_id: employee }]
    let list = []
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") arr.push({ order_date: new RegExp(current_regexDate) })
    let order_data = await Order.find({ $and: arr });
    arr.push({ delivery_status: "Delivered" })
    let delivered_order_data = await Order.find({ $and: arr });
    console.log(order_data);
    let total_order = order_data.length;
    let total_delivered_order = delivered_order_data.length;
    let total_order_value = 0;
    let total_delivered_order_value = 0;
    for (let i = 0; i < delivered_order_data.length; i++) {
      total_delivered_order_value += parseInt(delivered_order_data[i].total_amount)
    }
    for (let i = 0; i < order_data.length; i++) {
      total_order_value += parseInt(order_data[i].total_amount)
      let employee_data = await Employee.findOne({ _id: order_data[i].emp_id })
      let retailer_data = await Retailer.findOne({ _id: order_data[i].retailer_id })
      let state_data = await Location.findOne({ id: employee_data.headquarterState })
      let visit_data = await Visit.findOne({ retailer_id: retailer_data._id, visit_date: order_data[i].order_date })
      let beat_data = await Beat.findOne({ _id: visit_data.beat_id })
      let order_item_data = await OrderItem.find({ order_id: order_data[i]._id })
      let order_item_list = []
      for (let i = 0; i < order_item_data.length; i++) {
        let product_data = await Product.findOne({ _id: order_item_data[i].product_id })
        let u_data = {
          product_id: order_item_data[i].product_id,
          product_name: product_data.productName,
          product_price: order_item_data[i].product_price,
          quantity: order_item_data[i].quantity,
          sub_total_price: order_item_data[i].sub_total_price,
        }
        order_item_list.push(u_data)
      }
      let u_data = {
        order_id: order_data[i]._id,
        delivery_status: order_data[i].delivery_status,
        beat_name: beat_data.beatName,
        emp: employee_data.employeeName,
        state: state_data.name,
        order_date: order_data[i].order_date,
        retailer: retailer_data.firmName,
        total_amount: order_data[i].total_amount,
        order_details: order_item_list,
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Secondary orders", result: { list: list, total_order: total_order, total_order_value: total_order_value, total_delivered_order: total_delivered_order, total_delivered_order_value: total_delivered_order_value } })
  }
})

router.post('/secondary_order_summary', async (req, res) => {
  let order_id = req.body.order_id ? req.body.order_id : "";
  let order_data = await Order.findOne({ _id: order_id })
  if (!order_data) return res.json({ status: false, message: "Check order id", result: [] })
  let retailer_data = await Retailer.findOne({ _id: order_data.retailer_id })
  let data = {
    id: order_data._id,
    retailer: retailer_data.firmName,
    retailer_address: retailer_data.address,
    order_date: order_data.order_date,
    order_status: order_data.order_status,
    total_amount: order_data.total_amount,
  }
  let order_item_data = await OrderItem.find({ order_id: order_data._id })
  let list = []
  for (let i = 0; i < order_item_data.length; i++) {
    let product_data = await Product.findOne({ _id: order_item_data[i].product_id })
    let u_data = {
      product_id: order_item_data[i].product_id,
      product_name: product_data.productName,
      product_price: order_item_data[i].product_price,
      quantity: order_item_data[i].quantity,
      sub_total_price: order_item_data[i].sub_total_price,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Data", result: data, list })
})

router.post('/my_dashboard', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let productivity_rank = 1;
  let sales_rank = 1;
  let emp_data = await Employee.findOne({ _id: employee_id })
  let date = get_current_date().split(" ")[0];
  let tc = 0;
  let pc = 0;
  let sale_amount = 0;
  let personal_productivity = 0;
  let completd_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: date, visit_status: "Completed" })
  let productive_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: date, visit_status: "Completed", order_status: "Productive" })
  console.log(productive_market_visit_data.retailer_id);
  if (completd_market_visit_data.length > 0 && completd_market_visit_data.length > 0) {
    tc = completd_market_visit_data.length;
    pc = productive_market_visit_data.length;
    for (let i = 0; i < productive_market_visit_data.length; i++) {
      let order_data = await Order.findOne({ $and: [{ retailer_id: productive_market_visit_data[i].retailer_id }, { order_date: date }], })
      sale_amount += parseInt(order_data.total_amount);
    }
    personal_productivity = pc / tc
  } else {
    tc = 0;
    pc = 0;
    sale_amount = 0
    personal_productivity = 0
  }
  let emp_target_data = await EmployeeTarget.findOne({ employee_id })
  let attendance_data = await Attendance.findOne({ date2: date, emp_id: employee_id })
  let new_retailers = 0;
  var tbc = 0;
  if (attendance_data) {
    let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
    let route_arr = beat_data.route;
    for (let i = 0; i < route_arr.length; i++) {
      let retailer_data = await Retailer.find({ route_id: route_arr[i] })
      let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
      tbc += retailer_data.length;
      new_retailers += new_retailer_data.length;
    }
  }
  let all_emp_data = await Employee.find({ companyId: emp_data.companyId })
  for (let i = 0; i < all_emp_data.length; i++) {
    let completd_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: date, visit_status: "Completed" })
    let productive_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: date, visit_status: "Completed", order_status: "Productive" })
    var other_tc = 0;
    var other_pc = 0;
    var other_sale_amount = 0;
    var ratio = 0;
    // if(completd_market_visit_data.length<1){
    //   other_tc = 0;
    //   other_pc = 0;
    //   other_sale_amount = 0;
    //   ratio = 0;
    // }
    // if(productive_market_visit_data.length<1){
    //   other_pc = 0;
    //   other_tc = 0;
    //   other_sale_amount = 0;
    //   ratio = 0;
    // }
    if (productive_market_visit_data.length > 0 && completd_market_visit_data.length > 0) {
      other_tc = completd_market_visit_data.length;
      other_pc = productive_market_visit_data.length;
      other_sale_amount = 0;
      for (let i = 0; i < productive_market_visit_data.length; i++) {
        let order_data = await Order.findOne({ $and: [{ retailer_id: productive_market_visit_data[i].retailer_id }, { order_date: date }], })
        other_sale_amount += parseInt(order_data.total_amount);
      }
      ratio = other_pc / other_tc;
      if (ratio > personal_productivity) {
        productivity_rank++
      }
      if (other_sale_amount > sale_amount) {
        sales_rank++
      }
    }
  }
  let current_month = date.split("-")[1]
  let current_year = date.split("-")[0]
  let current_regexDate = `${current_year}-${current_month}-?[0-9]*`
  let mtd_expense_claim = 0;
  let expense_data = await ExpenseReport.find({ employee_id, submit_date: new RegExp(current_regexDate) });
  if (expense_data.length > 0) {
    for (let i = 0; i < expense_data.length; i++) {
      mtd_expense_claim += parseInt(expense_data[i].total_claim_amount)
    }
  }
  let current_secondary_sales_data = await Order.find({ emp_id: employee_id, order_date: new RegExp(current_regexDate) })
  let mtd_sale_amount = 0;
  for (let i = 0; i < current_secondary_sales_data.length; i++) {
    mtd_sale_amount += parseInt(current_secondary_sales_data[i].total_amount)
  }
  // mtd_sale_amount += current_secondary_sales_data.map(data=>{
  //   return parseInt(data.total_amount)
  // })
  let current_primary_sales_data = await PrimaryOrder.find({ emp_id: employee_id, date: new RegExp(current_regexDate) })
  let mtd_primary_sale_amount = 0;
  for (let i = 0; i < current_primary_sales_data.length; i++) {
    mtd_primary_sale_amount += parseInt(current_primary_sales_data[i].total_amount)
  }
  // mtd_primary_sale_amount += current_primary_sales_data.map(data=>{
  //   return parseInt(data.total_amount)
  // })
  if (current_month == "01") {
    var last_month = "12"
  } else {
    var last_month = parseInt(date.split("-")[1])
  }
  let last_year = date.split("-")[0]
  let last_regexDate = ``
  if (last_month < 10) {
    last_regexDate = `${last_year}-0${last_month - 1}-?[0-9]*`
  } else if (last_month > 9) {
    last_regexDate = `${last_year}-${last_month}-?[0-9]*`
  }
  let last_secondary_sales_data = await Order.find({ emp_id: employee_id, order_date: new RegExp(last_regexDate) })
  let lmtd_sale_amount = 0;
  for (let i = 0; i < last_secondary_sales_data.length; i++) {
    lmtd_sale_amount += parseInt(last_secondary_sales_data[i].total_amount)
  }
  // lmtd_sale_amount += last_secondary_sales_data.map(data=>{
  //   return parseInt(data.total_amount)
  // })
  let last_primary_sales_data = await PrimaryOrder.find({ emp_id: employee_id, date: new RegExp(last_regexDate) })
  let lmtd_primary_sale_amount = 0;
  for (let i = 0; i < last_primary_sales_data.length; i++) {
    lmtd_primary_sale_amount += parseInt(last_primary_sales_data[i].total_amount)
  }
  // lmtd_primary_sale_amount += last_primary_sales_data.map(data=>{
  //   return parseInt(data.total_amount)
  // })
  let mtd_tc = 0;
  let mtd_pc = 0;
  let mtd_completd_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: new RegExp(current_regexDate), visit_status: "Completed" })
  console.log("mtd_completd_market_visit_data------------", mtd_completd_market_visit_data.length);
  let mtd_productive_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: new RegExp(current_regexDate), visit_status: "Completed", order_status: "Productive" })
  console.log("mtd_productive_market_visit_data------------", mtd_productive_market_visit_data.length);
  if (mtd_completd_market_visit_data.length > 0 && mtd_productive_market_visit_data.length > 0) {
    mtd_tc = mtd_completd_market_visit_data.length;
    mtd_pc = mtd_productive_market_visit_data.length;
  } else {
    mtd_tc = 0;
    mtd_pc = 0;
  }
  let lmtd_tc = 0;
  let lmtd_pc = 0;
  let lmtd_completd_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: new RegExp(last_regexDate), visit_status: "Completed" })
  console.log("lmtd_completd_market_visit_data------------", lmtd_completd_market_visit_data.length);
  let lmtd_productive_market_visit_data = await Visit.find({ emp_id: employee_id, visit_date: new RegExp(last_regexDate), visit_status: "Completed", order_status: "Productive" })
  console.log("lmtd_productive_market_visit_data------------", lmtd_productive_market_visit_data.length);
  if (lmtd_completd_market_visit_data.length > 0 && lmtd_productive_market_visit_data.length > 0) {
    lmtd_tc = lmtd_completd_market_visit_data.length;
    lmtd_pc = lmtd_productive_market_visit_data.length;
  } else {
    lmtd_tc = 0;
    lmtd_pc = 0;
  }
  let data = {
    tc: tc,
    pc: pc,
    sale_amount: sale_amount,
    secondary_target: emp_target_data ? emp_target_data.Secondary_target : "0",
    primary_target: emp_target_data ? emp_target_data.primary_target : "0",
    tbc: tbc,
    productivity_ranking: productivity_rank,
    sales_ranking: sales_rank,
    mtd_sale_amount: mtd_sale_amount,
    mtd_primary_sale_amount: mtd_primary_sale_amount,
    lmtd_sale_amount: lmtd_sale_amount,
    lmtd_primary_sale_amount: lmtd_primary_sale_amount,
    new_retailers: new_retailers,
    mtd_expense_claim: mtd_expense_claim,
    mtd_tc: mtd_tc,
    mtd_pc: mtd_pc,
    lmtd_tc: lmtd_tc,
    lmtd_pc: lmtd_pc,
  }
  return res.json({ status: true, message: "Data", result: data })
})

// router.post('/account_ledger', async (req, res) => {
//   let date = get_current_date().split(" ")[0];
//   let start_date = req.body.start_date ? req.body.start_date : "";
//   let party_id = req.body.party_id ? req.body.party_id : "";
//   if (party_id == "") return res.json({ status: false, message: "Please provide the party id" })
//   let end_date = req.body.end_date ? req.body.end_date : "";
//   let account_list = []
//   if (start_date == "") return res.json({ status: false, message: "Please give start date" })
//   if (end_date != "") {
//     let y = new Date(end_date)
//     let x = new Date(start_date)
//     let diffTime = Math.abs(y - x);
//     var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   } else {
//     let y = new Date(date);
//     let x = new Date(start_date)
//     let diffTime = Math.abs(y - x);
//     var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   }
//   let total_credit = 0;
//   let total_debit = 0;
//   let total_balance = 0;
//   let past_credit = 0
//   let past_claim_data = await Claim.findOne({ claim_date: { $lte: start_date }, party_id })
//   let past_goods_return_voucher_data = await VoucherGoodsReturn.findOne({ date: { $lte: start_date }, party_id })
//   let past_goods_return_detailed_data = await DetailedGoodsReturn.findOne({ goods_return_date: { $lte: start_date }, party_id })
//   let past_collection_data = await PaymentCollection.findOne({ date: { $lte: start_date }, party_id })
//   let past_invoice_data = await Invoice.findOne({ date: { $lte: start_date }, party_id })
//   past_credit = (past_collection_data ? parseInt(past_collection_data.amount) : 0) + (past_claim_data ? parseInt(past_claim_data.claim_amount) : 0) + (past_goods_return_voucher_data ? parseInt(past_goods_return_voucher_data.net_amount) : 0) + (past_goods_return_detailed_data ? parseInt(past_goods_return_detailed_data.total_amount) : 0)
//   let u_data = {
//     date: start_date,
//     particular: "Remaining",
//     credit: past_credit,
//     debit: past_invoice_data ? past_invoice_data.total_amount : 0,
//     balance: past_credit - (past_invoice_data ? past_invoice_data.total_amount : 0),
//   }
//   account_list.push(u_data)
//   total_credit += past_credit
//   total_debit += past_invoice_data ? past_invoice_data.total_amount : 0
//   total_balance += (past_credit - (past_invoice_data ? past_invoice_data.total_amount : 0))
//   for (let i = 0; i <= diffDays; i++) {
//     let credit = 0
//     let claim_data = await Claim.findOne({ claim_date: start_date, party_id })
//     let goods_return_voucher_data = await VoucherGoodsReturn.findOne({ date: start_date, party_id })
//     let goods_return_detailed_data = await DetailedGoodsReturn.findOne({ goods_return_date: start_date, party_id })
//     let collection_data = await PaymentCollection.findOne({ date: start_date, party_id })
//     let invoice_data = await Invoice.findOne({ date: start_date, party_id })
//     credit = (collection_data ? parseInt(collection_data.amount) : 0) + (claim_data ? parseInt(claim_data.claim_amount) : 0) + (goods_return_voucher_data ? parseInt(goods_return_voucher_data.net_amount) : 0) + (goods_return_detailed_data ? parseInt(goods_return_detailed_data.total_amount) : 0)
//     if (credit != 0 || (invoice_data ? invoice_data.total_amount : 0) != 0) {
//       let u_data = {
//         date: start_date,
//         particular: "Sale",
//         credit: credit,
//         debit: invoice_data ? invoice_data.total_amount : 0,
//         balance: credit - (invoice_data ? invoice_data.total_amount : 0),
//       }
//       account_list.push(u_data)
//     }
//     total_credit += credit
//     total_debit += invoice_data ? invoice_data.total_amount : 0
//     total_balance += (credit - (invoice_data ? invoice_data.total_amount : 0))
//     let x = new Date(start_date)
//     x.setDate(x.getDate() + 1);
//     let zz = new Date(x).toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     })
//     let xx = zz.split("/")
//     yy = xx.reverse()
//     start_date = yy.join("-")
//     console.log("start_date----", typeof (start_date));
//   }
//   let summary = {
//     total_credit,
//     total_debit,
//     total_balance,
//   }
//   return res.json({ status: true, message: "Data", result: account_list, summary })
// })

router.post('/account_ledger', async (req, res) => {
  let date = get_current_date().split(" ")[0];
  let start_date = req.body.start_date ? req.body.start_date : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  if (party_id == "") return res.json({ status: false, message: "Please provide the party id" })
  let end_date = req.body.end_date ? req.body.end_date : "";
  let account_list = []
  if (start_date == "") return res.json({ status: false, message: "Please give start date" })
  if (end_date != "") {
    let y = new Date(end_date)
    let x = new Date(start_date)
    let diffTime = Math.abs(y - x);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    let y = new Date(date);
    let x = new Date(start_date)
    let diffTime = Math.abs(y - x);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  let total_credit = 0;
  let total_debit = 0;
  let total_balance = 0;
  let past_credit = 0
  // let past_claim_data = await Claim.findOne({ claim_date: { $lte: start_date }, party_id })
  // let past_goods_return_voucher_data = await VoucherGoodsReturn.findOne({ date: { $lte: start_date }, party_id })
  // let past_goods_return_detailed_data = await DetailedGoodsReturn.findOne({ goods_return_date: { $lte: start_date }, party_id })
  // let past_collection_data = await PaymentCollection.findOne({ date: { $lte: start_date }, party_id })
  // let past_invoice_data = await Invoice.findOne({ date: { $lte: start_date }, party_id })

  let lastDate = new Date(start_date).setDate(new Date(start_date).getDate() - 1)
  lastDate = `${new Date(lastDate).toLocaleDateString().split("/")[2]}-${new Date(lastDate).toLocaleDateString().split("/")[0]}-${new Date(lastDate).toLocaleDateString().split("/")[1]}`

  let past_claim_data = await Claim.find({ claim_date: { $lte: lastDate }, party_id })
  let past_goods_return_voucher_data = await VoucherGoodsReturn.find({ date: { $lte: lastDate }, party_id })
  // let past_goods_return_detailed_data = await DetailedGoodsReturn.find({ goods_return_date: { $lte: lastDate }, party_id })
  let past_collection_data = await PaymentCollection.find({ date: { $lte: lastDate }, party_id })
  let past_invoice_data = await Invoice.find({ invoice_date: { $lte: lastDate }, party_id })

  let total_past_claim_data = 0;
  let total_past_goods_return_voucher_data = 0;
  let total_past_collection_data = 0;
  let total_past_invoice_data = 0;

  if (past_claim_data?.length > 0) total_past_claim_data = past_claim_data.reduce((total, data) => { return total += Number(data.approved_amount) }, 0)
  if (past_goods_return_voucher_data?.length > 0) total_past_goods_return_voucher_data = past_goods_return_voucher_data.reduce((total, data) => { return total += Number(data.approved_amount) }, 0)
  if (past_collection_data?.length > 0) total_past_collection_data = past_collection_data.reduce((total, data) => { return total += Number(data.approved_amount) }, 0)
  if (past_invoice_data?.length > 0) total_past_invoice_data = past_invoice_data.reduce((total, data) => { return total += Number(data.invoice_amount) }, 0)

  past_credit = total_past_collection_data + total_past_claim_data + total_past_goods_return_voucher_data
  let u_data = {
    date: start_date,
    particular: "Opening Balance B/F",
    credit: '-',
    debit: '-',
    balance: total_balance,
  }
  account_list.push(u_data)
  // past_credit = (past_collection_data ? parseInt(past_collection_data.amount) : 0) + (past_claim_data ? parseInt(past_claim_data.claim_amount) : 0) + (past_goods_return_voucher_data ? parseInt(past_goods_return_voucher_data.net_amount) : 0) + (past_goods_return_detailed_data ? parseInt(past_goods_return_detailed_data.total_amount) : 0)
  // let u_data = {
  //   date: start_date,
  //   particular: "Remaining",
  //   credit: past_credit,
  //   debit: past_invoice_data ? past_invoice_data.total_amount : 0,
  //   balance: past_credit - (past_invoice_data ? past_invoice_data.total_amount : 0),
  // }
  // total_credit += past_credit
  // total_debit += past_invoice_data ? past_invoice_data.total_amount : 0
  // total_balance += (past_credit - (past_invoice_data ? past_invoice_data.total_amount : 0))
  for (let i = 0; i <= diffDays; i++) {
    // let credit = 0
    // let claim_data = await Claim.findOne({ claim_date: start_date, party_id })
    // let goods_return_voucher_data = await VoucherGoodsReturn.findOne({ date: start_date, party_id })
    // let goods_return_detailed_data = await DetailedGoodsReturn.findOne({ goods_return_date: start_date, party_id })
    // let collection_data = await PaymentCollection.findOne({ date: start_date, party_id })
    // let invoice_data = await Invoice.findOne({ date: start_date, party_id })
    // credit = (collection_data ? parseInt(collection_data.amount) : 0) + (claim_data ? parseInt(claim_data.claim_amount) : 0) + (goods_return_voucher_data ? parseInt(goods_return_voucher_data.net_amount) : 0) + (goods_return_detailed_data ? parseInt(goods_return_detailed_data.total_amount) : 0)

    let credit = 0
    let claim_data = await Claim.find({ claim_date: start_date, party_id })
    let goods_return_voucher_data = await VoucherGoodsReturn.find({ date: start_date, party_id })
    // let goods_return_detailed_data = await DetailedGoodsReturn.find({ goods_return_date: start_date, party_id })
    let collection_data = await PaymentCollection.find({ date: start_date, party_id })
    let invoice_data = await Invoice.find({ invoice_date: start_date, party_id })

    let totalDataArr = [...claim_data, ...goods_return_voucher_data, ...collection_data, ...invoice_data]
    totalDataArr = totalDataArr.sort((a, b) => new Date(a.Created_date).getTime() - new Date(b.Created_date).getTime())

    totalDataArr.map((trans, i) => {
      // console.log("i ---------------------->", trans.claim_type ? "claim" : trans.payment_mode ? "collection" : trans.tax ? "invoice" : "good return", trans)
      if (trans.claim_type) {
        // claim
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Claim",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: Math.abs(total_balance - Number(trans.approved_amount)),
        }
        total_balance = total_balance - Number(trans.approved_amount)
        account_list.push(u_data)
      } else if (trans.payment_mode) {
        // collection
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Collection",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: Math.abs(total_balance - Number(trans.approved_amount)),
        }
        total_balance = total_balance - Number(trans.approved_amount)
        account_list.push(u_data)
      } else if (trans.tax) {
        // invoice
        total_debit += Number(trans.invoice_amount)
        let u_data = {
          date: start_date,
          particular: "Sale",
          credit: '-',
          debit: Number(trans.invoice_amount),
          balance: Math.abs(Number(total_balance) + Number(trans.invoice_amount)),
        }
        total_balance = Number(total_balance) + Number(trans.invoice_amount)
        account_list.push(u_data)
      } else {
        // good return
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Good Return",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: Math.abs(total_balance - Number(trans.approved_amount)),
        }
        total_balance = total_balance - Number(trans.approved_amount)
        account_list.push(u_data)
      }
    })

    // if (credit != 0 || (invoice_data ? invoice_data.total_amount : 0) != 0) {
    //   let u_data = {
    //     date: start_date,
    //     particular: "Sale",
    //     credit: credit,
    //     debit: invoice_data ? invoice_data.total_amount : 0,
    //     balance: credit - (invoice_data ? invoice_data.total_amount : 0),
    //   }
    //   account_list.push(u_data)
    // }
    // total_credit += credit
    // total_debit += invoice_data ? invoice_data.total_amount : 0
    // total_balance += (credit - (invoice_data ? invoice_data.total_amount : 0))

    let x = new Date(start_date)
    x.setDate(x.getDate() + 1);
    let zz = new Date(x).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    let xx = zz.split("/")
    yy = xx.reverse()
    start_date = yy.join("-")
    console.log("start_date----", typeof (start_date));
  }
  let summary = {
    total_credit,
    total_debit,
    total_balance,
  }
  return res.json({ status: true, message: "Data", result: account_list, summary })
})

router.post('/dealer_wise_report', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  if (employee == "") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let list = []
    let employee_data = await Employee.findOne({ _id: employee_id });
    console.log("employee_data ---------------------------------------->", employee_data)
    if (employee_data.length < 1) return res.json({ status: true, message: "No employee found", result: [] })
    let party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
    console.log("party_data == '' ---------------------------------------->", party_data)
    // console.log('party_data-------',party_data)
    let condition1 = {}
    let condition2 = {}
    let condition = {}
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") condition.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition1.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition2.date = new RegExp(current_regexDate)
    var total_party = 0
    var total_active_party = 0
    var total_sale = 0
    var total_stock = 0
    var total_collection = 0
    var total_out_standing = 0
    for (let a = 0; a < party_data.length; a++) {
      let party = await Party.findOne({ _id: party_data[a].assigned_to_id })
      if (party) {
        condition1.emp_id = employee_id;
        condition.emp_id = employee_id;
        condition2.employee_id = employee_id;
        condition1.party_id = party._id;
        condition2.party_id = party._id;
        total_party++
        if (party.status == "Active") {
          total_active_party++
        }
        var primary_order_data = await PrimaryOrder.find(condition1)
        total_sale += primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
        var stock_data = await Stock.find(condition1)
        total_stock += stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
        var payment_collection_data = await PaymentCollection.find(condition2)
        total_collection += payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
        total_out_standing += total_sale - total_collection
      }
    }
    condition = {};
    if (month != "" && year != "") condition.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition1.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition2.date = new RegExp(current_regexDate)
    for (let i = 0; i < party_data.length; i++) {
      let party = await Party.findOne({ _id: party_data[i].assigned_to_id });
      if (party) {
        condition1.emp_id = employee_id;
        condition.emp_id = employee_id;
        condition2.employee_id = employee_id;
        condition1.party_id = party._id;
        condition2.party_id = party._id;
        console.log("condition1 -------------------------------------->", condition1)
        let visit_data = await PrimaryVisit.find(condition1)
        console.log("visit_data -------------------------------------------------------->", visit_data)
        let primary_order_data = await PrimaryOrder.find(condition1)
        let total_primary_sales = primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
        let payment_collection_data = await PaymentCollection.find(condition2)
        let total_payment_collection = payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
        let secondary_order_data = await Order.find(condition)
        let total_secondary_sales = secondary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
        let out_standing = total_primary_sales + total_secondary_sales - total_payment_collection
        let stock_data = await Stock.find(condition1)
        let stock = stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
        let u_data = {
          party: party.firmName,
          visit: visit_data.length,
          total_secondary_sales: total_secondary_sales,
          total_primary_sales: total_primary_sales,
          total_payment_collection: total_payment_collection,
          out_standing: out_standing,
          stock: stock
        }
        list.push(u_data)
      }
    }
    // console.log('list-------------------',list)
    return res.json({
      status: true, message: "Data", result: {
        list: list,
        total_party: total_party,
        total_active_party: total_active_party,
        total_sale: total_sale,
        total_stock: total_stock,
        total_collection: total_collection,
        total_out_standing: total_out_standing
      }
    })
  } else if (employee != '') {
    console.log("employee !== '' ---------------------------------------->")
    let list = []
    let employee_data = await Employee.findOne({ _id: employee });
    if (employee_data.length < 1) return res.json({ status: true, message: "No employee found", result: [] })
    let party_data = Mapping.find({ primary_id: employee, primary_type: "Employee", assigned_to_type: "Party" })
    console.log("party_data", party_data)
    let condition1 = {}
    let condition2 = {}
    let condition = {}
    let month = req.body.month ? req.body.month : "";
    let year = req.body.year ? req.body.year : "";
    let current_regexDate = `${year}-${month}-?[0-9]*`
    if (month != "" && year != "") condition.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition1.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition2.date = new RegExp(current_regexDate)
    var total_party = 0
    var total_active_party = 0
    var total_sale = 0
    var total_stock = 0
    var total_collection = 0
    var total_out_standing = 0
    for (let a = 0; a < party_data.length; a++) {
      condition1.emp_id = employee;
      condition.emp_id = employee;
      condition2.employee_id = employee;
      condition1.party_id = party_data[a]._id;
      condition2.party_id = party_data[a]._id;
      total_party++
      if (party_data[a].status == "Active") {
        total_active_party++
      }
      var primary_order_data = await PrimaryOrder.find(condition1)
      total_sale += primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
      var stock_data = await Stock.find(condition1)
      total_stock += stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
      var payment_collection_data = await PaymentCollection.find(condition2)
      total_collection += payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
      total_out_standing += total_sale - total_collection
    }
    condition = {};
    if (month != "" && year != "") condition.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition1.date = new RegExp(current_regexDate)
    if (month != "" && year != "") condition2.date = new RegExp(current_regexDate)
    for (let i = 0; i < party_data.length; i++) {
      condition1.emp_id = employee;
      condition.emp_id = employee;
      condition2.employee_id = employee;
      condition1.party_id = party_data[i]._id;
      condition2.party_id = party_data[i]._id;
      let visit_data = await PrimaryVisit.find(condition1)
      let primary_order_data = await PrimaryOrder.find(condition1)
      let total_primary_sales = primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
      let payment_collection_data = await PaymentCollection.find(condition2)
      let total_payment_collection = payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
      let secondary_order_data = await Order.find(condition)
      let total_secondary_sales = secondary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
      let out_standing = total_primary_sales + total_secondary_sales - total_payment_collection
      let stock_data = await Stock.find(condition1)
      let stock = stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
      let u_data = {
        party: party_data[i].firmName,
        visit: visit_data.length,
        total_secondary_sales: total_secondary_sales,
        total_primary_sales: total_primary_sales,
        total_payment_collection: total_payment_collection,
        out_standing: out_standing,
        stock: stock
      }
      list.push(u_data)
    }
    return res.json({
      status: true, message: "Data", result: {
        list: list,
        total_party: total_party,
        total_active_party: total_active_party,
        total_sale: total_sale,
        total_stock: total_stock,
        total_collection: total_collection,
        total_out_standing: total_out_standing
      }
    })
  }
})

// router.post('/dealer_wise_report', async (req, res) => {
//   try {
//     const { employee, month, year } = req.body;

//     let employee_id;
//     if (!employee) {
//       const authHeader = req.headers["authorization"];
//       const token = authHeader && authHeader.split(" ")[1];
//       if (!token) {
//         return res.json({
//           status: false,
//           message: "Token must be provided"
//         });
//       }
//       var decodedToken = jwt.verify(token, "test");
//       employee_id = decodedToken.user_id;
//     } else {
//       employee_id = employee;
//     }

//     const employee_data = await Employee.findOne({ _id: employee_id });
//     if (!employee_data) {
//       return res.json({ status: true, message: "No employee found", result: [] });
//     }

//     const party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" });

//     let condition = {};
//     if (month && year) {
//       const current_regexDate = `${year}-${month}-?[0-9]*`;
//       condition.date = new RegExp(current_regexDate);
//     }

//     const partyPromises = party_data.map(async (party) => {
//       const partyObj = await Party.findOne({ _id: party.assigned_to_id });
//       if (partyObj) {
//         const condition1 = {
//           emp_id: employee_id,
//           party_id: partyObj._id,
//           ...condition
//         };

//         const [primaryOrderData, stockData, paymentCollectionData] = await Promise.all([
//           PrimaryOrder.find(condition1),
//           Stock.find(condition1),
//           PaymentCollection.find({ employee_id, party_id: partyObj._id, ...condition })
//         ]);

//         const total_sale = primaryOrderData.reduce((sum, data) => sum + parseInt(data.total_amount), 0);
//         const total_stock = stockData.reduce((sum, data) => sum + parseInt(data.total_amount), 0);
//         const total_collection = paymentCollectionData.reduce((sum, data) => sum + parseInt(data.amount), 0);
//         const total_out_standing = total_sale - total_collection;

//         return {
//           party: partyObj.firmName,
//           total_sale,
//           total_stock,
//           total_collection,
//           total_out_standing
//         };
//       }
//     });

//     const partyResults = await Promise.all(partyPromises);
//     const filteredParties = partyResults.filter(party => party); // Remove null values

//     const visitPromises = filteredParties.map(async (party) => {
//       const condition1 = {
//         emp_id: employee_id,
//         party_id: party.party_id,
//         ...condition
//       };

//       const [visitData, primaryOrderData, paymentCollectionData] = await Promise.all([
//         Visit.find(condition1),
//         PrimaryOrder.find(condition1),
//         PaymentCollection.find({ employee_id, party_id: party.party_id, ...condition })
//       ]);

//       const total_primary_sales = primaryOrderData.reduce((sum, data) => sum + parseInt(data.total_amount), 0);
//       const total_payment_collection = paymentCollectionData.reduce((sum, data) => sum + parseInt(data.amount), 0);
//       const total_secondary_sales = 0; // Update this with the correct data source for secondary sales
//       const out_standing = total_primary_sales + total_secondary_sales - total_payment_collection;
//       const stockData = await Stock.find(condition1);
//       const stock = stockData.reduce((sum, data) => sum + parseInt(data.total_amount), 0);

//       return {
//         party: party.party,
//         visit: visitData.length,
//         total_secondary_sales,
//         total_primary_sales,
//         total_payment_collection,
//         out_standing,
//         stock
//       };
//     });

//     const visitResults = await Promise.all(visitPromises);

//     const total_party = filteredParties.length;
//     const total_active_party = filteredParties.filter(party => party.status === "Active").length;
//     const total_sale = filteredParties.reduce((sum, party) => sum + party.total_sale, 0);
//     const total_stock = filteredParties.reduce((sum, party) => sum + party.total_stock, 0);
//     const total_collection = filteredParties.reduce((sum, party) => sum + party.total_collection, 0);
//     const total_out_standing = filteredParties.reduce((sum, party) => sum + party.total_out_standing, 0);

//     return res.json({
//       status: true,
//       message: "Data",
//       result: {
//         list: visitResults,
//         total_party,
//         total_active_party,
//         total_sale,
//         total_stock,
//         total_collection,
//         total_out_standing
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     return res.json({ status: false, message: "An error occurred", error: error });
//   }
// });

router.post('/salary_slip', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id })
  if (!emp_data) return res.json({ status: false, message: "No employee found", result: [] });
  let date = get_current_date().split(" ")[0];
  let month = date.split("-")[1]
  let year = date.split("-")[0]
  let day = date.split("-")[2]
  let current_regexDate = `${year}-${month}-?[0-9]*`
  let attendance_data = await Attendance.find({ emp_id: employee_id, date2: new RegExp(current_regexDate) })
  if (attendance_data.length > 0) {
    var present = attendance_data.length;
    var holiday = 2;
    var weekOff = 4;
  }
  let x = holiday + weekOff
  let salary_per_day = emp_data.userExpenses ? (emp_data.userExpenses.salaryAll) / (day - x) : "NA"
  let earning = emp_data.userExpenses ? Math.ceil(salary_per_day * (present)) : "NA"
  let deduction = emp_data.userExpenses ? Math.ceil(parseInt(emp_data.userExpenses.salaryAll) - earning) : "NA";
  let data = {
    gross_pay: emp_data.userExpenses ? emp_data.userExpenses.salaryAll : "NA",
    earning: earning,
    deduction: deduction,
    basic_pay: emp_data.userExpenses ? emp_data.userExpenses.salaryAll : "NA",
    hra: emp_data.transportWays ? emp_data.transportWays.salaryHRA : "NA",
    other_allowance: emp_data.userExpenses ? emp_data.userExpenses.salaryConvyence : "NA",
    spl_allowance: emp_data.userExpenses ? emp_data.userExpenses.salaryConvyence : "NA"
  }
  return res.json({ status: true, message: "Data", result: data })
})

router.post('/mark_sec_orders_deliveres', async (req, res) => {
  let order_id = req.body.order_id ? req.body.order_id : "";
  let order_data = await Order.findOneAndUpdate({ _id: order_id }, { $set: { delivery_status: "Delivered" } })
  let order_item_data = await OrderItem.find({ order_id })
  for (let i = 0; i < order_item_data.length; i++) {
    let new_order_item_data = await OrderItem.findOneAndUpdate({ order_id }, { $set: { delivery_status: "Delivered" } })
  }
  return res.json({ status: true, message: "Marked as delivered" })
})

router.post('/mark_delivered_sec_orders', async (req, res) => {
  let order_id = req.body.order_id ? req.body.order_id : "";
  if (order_id == "") return res.json({ status: false, message: "Please give the order_id" })
  let order_result = await Order.findOneAndUpdate({ _id: order_id }, { $set: { delivery_status: "Delivered" } })
  let order_item_result = await OrderItem.find({ order_id })
  for (let i = 0; i < order_item_result.length; i++) {
    let result = await OrderItem.findOneAndUpdate({ _id: order_item_result[i]._id }, { $set: { order_status: "Delivered" } })
  }
  return res.json({ status: true, message: "Marked as Delivered" })
})

router.post('/team_dashboard', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  console.log('emp_data---', emp_data);
  let company_id = emp_data.companyId;
  let date = get_current_date().split(" ")[0]
  let screen_type = req.body.screen_type ? req.body.screen_type : "";
  if (screen_type == "today") {
    let online_emp = 0
    let offline_emp = 0
    let leave_emp = 0
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_tcs = []
    let total_pcs = []
    let total_ncs = []
    let online_emps = []
    let offline_emps = []
    let leave_emps = []
    let active_user_15_min = 0;
    let active_user_1_hr = 0;
    let active_user_3_hr = 0;
    let active_users_15_min = [];
    let active_users_1_hr = [];
    let active_users_3_hr = [];
    let role_data = await Role.findOne({ _id: emp_data.roleId })
    if (!role_data) {
      return res.json({
        status: true,
        message: "No Role found",
        result: {},
      });
    }
    var hierarchy_level = parseInt(role_data.hierarchy_level);
    // console.log('hierarchy_level------', hierarchy_level)
    var role_new_data = await Role.find({ company_id });
    var role_id_array = [];
    role_new_data.forEach((r_data) => {
      if (r_data.hierarchy_level > hierarchy_level) {
        role_id_array.push(r_data._id);
      }
    });
    var team_data = await Employee.find({ $and: [{ roleId: { $in: role_id_array } }, { companyId: company_id }] })
    // let all_emp_data = await Employee.find({ companyId: company_id, is_delete: "0" });
    for (let i = 0; i < team_data.length; i++) {
      let attendance_data = await Attendance.findOne({ date2: date, emp_id: team_data[i]._id })
      let leave_data = await Leave.findOne({ date1: date, emp_id: team_data[i]._id });
      if (attendance_data) {
        let check = await Check.findOne({ $and: [{ check_in_date: date }, { emp_id: team_data[i]._id }] });
        if (check) {
          let current_time = new Date().getTime()
          // if (((current_time - check.check_in_time.getTime()) / (1000 * 60)) <= 15) {
          //   let u_data = {
          //     emp_name: team_data[i].employeeName,
          //     location: attendance_data.location,
          //     image: team_data[i].image,
          //   }
          //   active_users_15_min.push(u_data)
          //   active_user_15_min++;
          // } else {
          //   if (((current_time - check.check_in_time.getTime()) / (1000 * 60 * 60)) <= 1) {
          //     let u_data = {
          //       emp_name: team_data[i].employeeName,
          //       location: attendance_data.location,
          //       image: team_data[i].image,
          //     }
          //     active_users_1_hr.push(u_data)
          //     active_user_1_hr++;
          //   } else if (((current_time - check.check_in_time.getTime()) / (1000 * 60 * 60)) <= 3) {
          //     let u_data = {
          //       emp_name: team_data[i].employeeName,
          //       location: attendance_data.location,
          //       image: team_data[i].image,
          //     }
          //     active_users_3_hr.push(u_data)
          //     active_user_3_hr++;
          //   }
          // }
          let tracking_data = await Tracking.findOne({ emp_id: team_data[i]._id, date });
          if (tracking_data) {
            last_location_time = new Date(tracking_data.location.reverse()[0].date);
            console.log('difference--------', ((current_time - last_location_time.getTime()) / (1000 * 60)))
            if (((current_time - last_location_time.getTime()) / (1000 * 60)) <= 15) {
              console.log('last active 15 min ago');
              let u_data = {
                emp_name: team_data[i].employeeName,
                location: attendance_data.location,
                image: team_data[i].image,
              }
              active_users_15_min.push(u_data)
              active_user_15_min++;
            } else if (((current_time - last_location_time.getTime()) / (1000 * 60)) > 15 && ((current_time - last_location_time.getTime()) / (1000 * 60)) <= 60) {
              console.log('last active 16 to 60 min ago');
              let u_data = {
                emp_name: team_data[i].employeeName,
                location: attendance_data.location,
                image: team_data[i].image,
              }
              active_users_1_hr.push(u_data)
              active_user_1_hr++;
            } else if (((current_time - last_location_time.getTime()) / (1000 * 60)) > 60 && ((current_time - last_location_time.getTime()) / (1000 * 60)) <= 180) {
              console.log('last active 60 to 180 min ago');
              let u_data = {
                emp_name: team_data[i].employeeName,
                location: attendance_data.location,
                image: team_data[i].image,
              }
              active_users_3_hr.push(u_data)
              active_user_3_hr++;
            } else {
              console.log('last active more than 180 mins ago')
            }
          }
        }
        let completd_market_visit_data = await Visit.find({ emp_id: team_data[i]._id, visit_date: date, visit_status: "Completed" })
        let productive_market_visit_data = await Visit.find({ emp_id: team_data[i]._id, visit_date: date, visit_status: "Completed", order_status: "Productive" })
        let new_retailer_data = await Retailer.find({ date: date, employee_id: team_data[i]._id });
        if (new_retailer_data.length > 0) {
          for (let a = 0; a < new_retailer_data.length; a++) {
            // console.log(a)
            let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
            let order_data = await Order.findOne({ retailer_id: new_retailer_data[a]._id, order_date: date });
            let completd_market_visit_data = await Visit.findOne({ retailer_id: new_retailer_data[a]._id, visit_date: date, visit_status: "Completed" })
            if (completd_market_visit_data) {
              if (completd_market_visit_data.order_status == "Non-Productive") {
                let u_data = {
                  emp_name: team_data[i].employeeName,
                  retailer_name: new_retailer_data[a].customerName,
                  beat_name: beat_data.beatName,
                  status: '',
                  reason: completd_market_visit_data.no_order_reason,
                  image: team_data[i].image,
                }
                total_ncs.push(u_data)
              } else if (completd_market_visit_data.order_status == "Productive") {
                let u_data = {
                  emp_name: team_data[i].employeeName,
                  retailer_name: new_retailer_data[a].customerName,
                  beat_name: beat_data.beatName,
                  status: order_data.order_status,
                  total_sale: order_data.total_amount,
                  image: team_data[i].image,
                }
                total_ncs.push(u_data)
              }
            } else {
              console.log("inside else")
              let u_data = {
                emp_name: team_data[i].employeeName,
                retailer_name: new_retailer_data[a].customerName,
                beat_name: beat_data.beatName,
                status: "Pending",
                total_sale: "NA",
                reason: "NA",
                image: team_data[i].image,
              }
              total_ncs.push(u_data)
            }
          }
          total_nc += new_retailer_data.length;
        }
        if (completd_market_visit_data.length > 0) {
          for (let a = 0; a < completd_market_visit_data.length; a++) {
            let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
            let order_data = await Order.findOne({ retailer_id: completd_market_visit_data[a].retailer_id, order_date: date })
            let retailer_data = await Retailer.findOne({ _id: completd_market_visit_data[a].retailer_id });
            if (completd_market_visit_data[a].order_status == "Non-Productive") {
              let u_data = {
                emp_name: team_data[i].employeeName,
                retailer_name: retailer_data.customerName,
                beat_name: beat_data.beatName,
                status: '',
                reason: completd_market_visit_data[a].no_order_reason,
                image: team_data[i].image,
              }
              total_tcs.push(u_data)
            } else if (completd_market_visit_data[a].order_status == "Productive") {
              let u_data = {
                emp_name: team_data[i].employeeName,
                retailer_name: retailer_data.customerName,
                beat_name: beat_data.beatName,
                status: order_data.order_status,
                total_sale: order_data.total_amount,
                image: team_data[i].image,
              }
              total_tcs.push(u_data)
            }
          }
          total_tc += completd_market_visit_data.length;
          if (productive_market_visit_data.length > 0) {
            for (let a = 0; a < productive_market_visit_data.length; a++) {
              let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
              let order_data = await Order.findOne({ retailer_id: productive_market_visit_data[a].retailer_id, order_date: date })
              let retailer_data = await Retailer.findOne({ _id: productive_market_visit_data[a].retailer_id });
              let u_data = {
                emp_name: team_data[i].employeeName,
                retailer_name: retailer_data.customerName,
                beat_name: beat_data.beatName,
                status: order_data.order_status,
                total_sale: order_data.total_amount,
                image: team_data[i].image,
              }
              total_pcs.push(u_data)
            }
            total_pc += productive_market_visit_data.length;
          }
        }
        let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
        let party_name_list = [];
        // console.log("attendance_data.party_id_arr---", attendance_data.party_id_arr)
        let arr = attendance_data.party_id_arr[0] ? attendance_data.party_id_arr[0].split(",") : []
        for (let a = 0; a < arr.length; a++) {
          let party_data = await Party.findOne({ _id: arr[a] })
          let data = {
            party_name: party_data.firmName,
          }
          party_name_list.push(data);
        }
        let u_data = {
          emp_name: team_data[i].employeeName,
          dealer_name: party_name_list,
          beat_name: beat_data.beatName,
          purpose: attendance_data.activity_id || "NA",
          location: attendance_data.location,
          image: team_data[i].image,
        }
        online_emps.push(u_data)
        online_emp++
      } else if (leave_data) {
        // let leave_data = await Leave.findOne({emp__id:team_data[i]._id,date1:date});
        let u_data = {
          emp_name: team_data[i].employeeName,
          date: leave_data.date1,
          reason: leave_data.reason,
          specification: leave_data.specific_reason,
          image: team_data[i].image,
        }
        leave_emps.push(u_data)
        leave_emp++
      } else {
        let state_data = await Location.findOne({ id: team_data[i].headquarterState })
        let city_data = await Location.findOne({ id: team_data[i].headquarterCity })
        let role_data = await Role.findOne({ _id: team_data[i].roleId });
        let u_data = {
          emp_name: team_data[i].employeeName,
          state: state_data.name,
          city: city_data.name,
          designation: role_data ? role_data.rolename : "NA",
          date: date,
          image: team_data[i].image,
        }
        offline_emps.push(u_data)
        offline_emp++
      }
    }
    // console.log('total_tcs-------------',total_tcs)
    // console.log('total_pcs-------------',total_pcs)
    // console.log('total_ncs-------------',total_ncs)
    let data = {
      online_emp: online_emp,
      offline_emp: offline_emp,
      leave_emp: leave_emp,
      total_tc: total_tc,
      total_pc: total_pc,
      total_nc: total_nc,
      online_emps: online_emps,
      offline_emps: offline_emps,
      leave_emps: leave_emps,
      total_emp: team_data.length,
      total_tcs: total_tcs,
      total_pcs: total_pcs,
      total_ncs: total_ncs,
      active_user_15_min: active_user_15_min,
      active_user_1_hr: active_user_1_hr,
      active_user_3_hr: active_user_3_hr,
      active_users_15_min: active_users_15_min,
      active_users_1_hr: active_users_1_hr,
      active_users_3_hr: active_users_3_hr,
    }
    return res.json({ status: true, message: "Todays team dashboard data", result: data })
  } else if (screen_type == "mtd") {
    let list = []
    let role_data = await Role.findOne({ _id: emp_data.roleId })
    if (!role_data) {
      return res.json({
        status: true,
        message: "No Role found",
        result: {},
      });
    }
    var hierarchy_level = parseInt(role_data.hierarchy_level);
    console.log('hierarchy_level------', hierarchy_level)
    var role_new_data = await Role.find({ company_id });
    var role_id_array = [];
    role_new_data.forEach((r_data) => {
      if (r_data.hierarchy_level > hierarchy_level) {
        role_id_array.push(r_data._id);
      }
    });
    var all_emp_data = await Employee.find({ $and: [{ roleId: { $in: role_id_array } }, { companyId: company_id }] })
    // let all_emp_data = await Employee.find({ companyId: company_id })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    for (let i = 0; i < all_emp_data.length; i++) {
      let tc = 0
      let pc = 0
      let nc = 0
      let sale = 0
      let current_month = date.split("-")[1]
      let current_year = date.split("-")[0]
      var current_month_regex = `${current_year}-${current_month}-?[0-9]*`
      let completd_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: new RegExp(current_month_regex), visit_status: "Completed" })
      let productive_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: new RegExp(current_month_regex), visit_status: "Completed", order_status: "Productive" })
      if (completd_market_visit_data.length > 0) {
        tc = completd_market_visit_data.length
        total_tc += completd_market_visit_data.length;
        if (productive_market_visit_data.length > 0) {
          for (let j = 0; j < productive_market_visit_data.length; j++) {
            let order_data = await Order.findOne({ retailer_id: productive_market_visit_data[j].retailer_id, order_date: productive_market_visit_data[j].visit_date })
            sale += parseInt(order_data.total_amount)
            total_sale += parseInt(order_data.total_amount)
          }
          pc = productive_market_visit_data.length;
          total_pc += productive_market_visit_data.length;

        }
      }
      let new_retailer_data = await Retailer.find({ date: new RegExp(current_month_regex), employee_id: all_emp_data[i]._id });
      if (new_retailer_data.length > 0) {
        nc = new_retailer_data.length;
        total_nc += new_retailer_data.length;
      }
      let u_data = {
        emp_name: all_emp_data[i].employeeName,
        emp_image: all_emp_data[i].image,
        tc: tc,
        pc: pc,
        nc: nc,
        sale: sale,
      }
      list.push(u_data)
    }
    // const catagory_data = await ProductCatagory.find({ company_id }).limit(5 * 1);

    // const catagory_wise_sec_sale = await Promise.all(
    //   catagory_data.map(async (catagory) => {
    //     let emp_wise_cat_sale_amount = 0;

    //     for (let i = 0; i < all_emp_data.length; i++) {
    //       console.log('name---',all_emp_data[i].employeeName);
    //       const productive_market_visit_data = await Visit.find({
    //         emp_id: all_emp_data[i]._id,
    //         visit_date: new RegExp(current_month_regex),
    //         visit_status: "Completed",
    //         order_status: "Productive",
    //       });
    //       console.log('productive_market_visit_data---',productive_market_visit_data);
    //       if (productive_market_visit_data.length > 0) {
    //         const empIds = all_emp_data.map((emp) => emp._id);

    //         const emp_cat_wise_order_data = await Order.find({
    //           emp_id: { $in: empIds },
    //           order_date: { $in: productive_market_visit_data.map((visit) => visit.visit_date) },
    //         });
    //         console.log('emp_cat_wise_order_data-----',emp_cat_wise_order_data);

    //         for (let l = 0; l < emp_cat_wise_order_data.length; l++) {
    //           const order_item_data = await OrderItem.find({ order_id: emp_cat_wise_order_data[l]._id });

    //           for (let m = 0; m < order_item_data.length; m++) {
    //             if (order_item_data[m].catagory_id === catagory._id) {
    //               emp_wise_cat_sale_amount += parseInt(order_item_data[m].sub_total_price);
    //             }
    //           }
    //         }
    //       }
    //     }

    //     return {
    //       catagory_name: catagory.name,
    //       catagory_sale_amount: emp_wise_cat_sale_amount,
    //     };
    //   })
    // );

    let catagory_data = await ProductCatagory.find({ company_id }).limit(5 * 1);
    let catagory_wise_sec_sale = []
    for (let k = 0; k < catagory_data.length; k++) {
      let emp_wise_cat_sale_amount = 0
      for (let i = 0; i < all_emp_data.length; i++) {
        let order_item_data = await OrderItem.find({ emp_id: all_emp_data[i]._id, date: new RegExp(current_month_regex) })
        console.log(`employee name--${all_emp_data[i].employeeName}---${order_item_data}`);
        for (let m = 0; m < order_item_data.length; m++) {
          if (order_item_data[m].catagory_id == catagory_data[k]._id) {
            emp_wise_cat_sale_amount += parseInt(order_item_data[m].sub_total_price)
          }
          console.log('emp_wise_cat_sale_amount---', emp_wise_cat_sale_amount);
        }
      }
      var x = {
        catagory_name: catagory_data[k].name,
        catagory_sale_amount: emp_wise_cat_sale_amount,
      }
      catagory_wise_sec_sale.push(x);
    }

    // let catagory_data = await ProductCatagory.find({ company_id }).limit(5 * 1);
    // let catagory_wise_sec_sale = []
    // for (let k = 0; k < catagory_data.length; k++) {
    //   let emp_wise_cat_sale_amount = 0
    //   for(let i = 0;i<all_emp_data.length;i++){
    //     let productive_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: new RegExp(current_month_regex), visit_status: "Completed", order_status: "Productive" })
    //     if(productive_market_visit_data.length>0){
    //       for(let j = 0;j<productive_market_visit_data.length;j++){
    //         let emp_cat_wise_order_data = await Order.find({ emp_id:all_emp_data[i]._id, order_date: productive_market_visit_data[j].visit_date })
    //         for(let l = 0;l<emp_cat_wise_order_data.length;l++){
    //           let order_item_data = await OrderItem.find({order_id:emp_cat_wise_order_data[l]._id})
    //           for(let m = 0;m<order_item_data.length;m++){
    //             if(order_item_data[m].catagory_id == catagory_data[k]._id ){
    //               emp_wise_cat_sale_amount += parseInt(order_item_data[m].sub_total_price)
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    //   var x = {
    //     catagory_name: catagory_data[k].name,
    //     catagory_sale_amount: emp_wise_cat_sale_amount,
    //   }
    //   catagory_wise_sec_sale.push(x);
    // }
    let data = {
      market_visits: list,
      total_tc: total_tc,
      total_pc: total_pc,
      total_nc: total_nc,
      total_sale: total_sale,
      catagory_wise_sec_sale: catagory_wise_sec_sale,
    }
    return res.json({ status: true, message: "MTD Team dashboard", result: data })
  } else if (screen_type == "ytd") {
    let list = [];
    let role_data = await Role.findOne({ _id: emp_data.roleId })
    if (!role_data) {
      return res.json({
        status: true,
        message: "No Role found",
        result: {},
      });
    }
    var hierarchy_level = parseInt(role_data.hierarchy_level);
    console.log('hierarchy_level------', hierarchy_level)
    var role_new_data = await Role.find({ company_id });
    var role_id_array = [];
    role_new_data.forEach((r_data) => {
      if (r_data.hierarchy_level > hierarchy_level) {
        role_id_array.push(r_data._id);
      }
    });
    var all_emp_data = await Employee.find({ $and: [{ roleId: { $in: role_id_array } }, { companyId: company_id }] })
    // let all_emp_data = await Employee.find({ companyId: company_id })
    let total_tc = 0
    let total_pc = 0
    let total_nc = 0
    let total_sale = 0
    for (let i = 0; i < all_emp_data.length; i++) {
      let tc = 0
      let pc = 0
      let nc = 0
      let sale = 0
      let current_year = date.split("-")[0]
      var current_year_regex = `${current_year}-?[0-9]*-?[0-9]*`
      let completd_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: new RegExp(current_year_regex), visit_status: "Completed" })
      let productive_market_visit_data = await Visit.find({ emp_id: all_emp_data[i]._id, visit_date: new RegExp(current_year_regex), visit_status: "Completed", order_status: "Productive" })
      if (completd_market_visit_data.length > 0) {
        tc = completd_market_visit_data.length
        total_tc += completd_market_visit_data.length;
        if (productive_market_visit_data.length > 0) {
          for (let j = 0; j < productive_market_visit_data.length; j++) {
            let order_data = await Order.findOne({ emp_id: all_emp_data[i]._id, retailer_id: productive_market_visit_data[j].retailer_id, order_date: productive_market_visit_data[j].visit_date })
            sale += parseInt(order_data.total_amount)
            total_sale += parseInt(order_data.total_amount)
          }
          pc = productive_market_visit_data.length;
          total_pc += productive_market_visit_data.length;
        }
      }
      let new_retailer_data = await Retailer.find({ date: new RegExp(current_year_regex), employee_id: all_emp_data[i]._id });
      if (new_retailer_data.length > 0) {
        nc = new_retailer_data.length;
        total_nc += new_retailer_data.length;
      }
      let u_data = {
        emp_name: all_emp_data[i].employeeName,
        emp_image: all_emp_data[i].image,
        tc: tc,
        pc: pc,
        nc: nc,
        sale: sale,
      }
      list.push(u_data)
    }
    // Query to fetch category data
    // const categoryData = await ProductCatagory.aggregate([
    //   { $match: { company_id } },
    //   { $limit: 5 },
    // ]);

    // const categoryIds = categoryData.map((category) => category._id);

    // // Query to fetch order item data for the specified categories and current year
    // const orderItemData = await OrderItem.aggregate([
    //   {
    //     $match: {
    //       emp_id: { $in: all_emp_data.map((emp) => emp._id) },
    //       date: new RegExp(current_year_regex),
    //       category_id: { $in: categoryIds },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$category_id",
    //       total_sale_amount: { $sum: { $toInt: "$sub_total_price" } },
    //     },
    //   },
    // ]);

    // // Prepare the category-wise sale data
    // const categoryWiseSale = categoryData.map((category) => {
    //   const categorySaleData = orderItemData.find(
    //     (item) => item._id.toString() === category._id.toString()
    //   );
    //   const saleAmount = categorySaleData ? categorySaleData.total_sale_amount : 0;

    //   return {
    //     category_name: category.name,
    //     category_sale_amount: saleAmount,
    //   };
    // });

    // // Final result
    // const categoryWiseSaleData = categoryWiseSale.map((sale) => {
    //   return {
    //     category_name: sale.category_name,
    //     category_sale_amount: parseInt(sale.category_sale_amount),
    //   };
    // });

    let catagory_data = await ProductCatagory.find({ company_id }).limit(5 * 1);
    let catagory_wise_sec_sale = []
    for (let k = 0; k < catagory_data.length; k++) {
      let emp_wise_cat_sale_amount = 0
      for (let i = 0; i < all_emp_data.length; i++) {
        let order_item_data = await OrderItem.find({ emp_id: all_emp_data[i]._id, date: new RegExp(current_year_regex) })
        console.log(`employee name--${all_emp_data[i].employeeName}---${order_item_data}`);
        for (let m = 0; m < order_item_data.length; m++) {
          if (order_item_data[m].catagory_id == catagory_data[k]._id) {
            emp_wise_cat_sale_amount += parseInt(order_item_data[m].sub_total_price)
          }
          console.log('emp_wise_cat_sale_amount---', emp_wise_cat_sale_amount);
        }
      }
      var x = {
        catagory_name: catagory_data[k].name,
        catagory_sale_amount: emp_wise_cat_sale_amount,
      }
      catagory_wise_sec_sale.push(x);
    }
    //     const catagoryData = await ProductCatagory.find({ company_id }).limit(5 * 1);
    // const catagoryWiseSecSale = [];

    // await Promise.all(
    //   catagoryData.map(async (catagory) => {
    //     let empWiseCatSaleAmount = 0;

    //     await Promise.all(
    //       all_emp_data.map(async (employee) => {
    //         const productiveMarketVisitData = await Visit.find({
    //           emp_id: employee._id,
    //           visit_date: new RegExp(current_year_regex),
    //           visit_status: "Completed",
    //           order_status: "Productive",
    //         });

    //         if (productiveMarketVisitData.length > 0) {
    //           await Promise.all(
    //             productiveMarketVisitData.map(async (visit) => {
    //               const empCatWiseOrderData = await Order.find({
    //                 emp_id: employee._id,
    //                 retailer_id: visit.retailer_id,
    //                 order_date: visit.visit_date,
    //               });

    //               await Promise.all(
    //                 empCatWiseOrderData.map(async (order) => {
    //                   const orderItemData = await OrderItem.find({
    //                     order_id: order._id,
    //                   });

    //                   orderItemData.forEach((item) => {
    //                     if (item.catagory_id == catagory._id) {
    //                       empWiseCatSaleAmount += parseInt(item.sub_total_price);
    //                     }
    //                   });
    //                 })
    //               );
    //             })
    //           );
    //         }
    //       })
    //     );

    //     const x = {
    //       catagory_name: catagory.name,
    //       catagory_sale_amount: empWiseCatSaleAmount,
    //     };

    //     catagoryWiseSecSale.push(x);
    //   })
    // );

    // Fetch catagoryData
    // const catagoryData = await ProductCatagory.find({ company_id }).limit(5 * 1);
    // const categoryIds = catagoryData.map((category) => category._id);

    // console.log('categoryIds:', categoryIds);

    // const productiveMarketVisitData = await Visit.find({
    //   emp_id: { $in: all_emp_data.map((emp) => emp._id) },
    //   visit_date: new RegExp(current_year_regex),
    //   visit_status: "Completed",
    //   order_status: "Productive",
    // });

    // console.log('productiveMarketVisitData:', productiveMarketVisitData);

    // const groupedVisits = productiveMarketVisitData.reduce((result, visit) => {
    //   const key = `${visit.emp_id}`;
    //   if (!result[key]) {
    //     result[key] = [];
    //   }
    //   result[key].push(visit);
    //   return result;
    // }, {});

    // const orderItemDataQuery = [
    //   {
    //     $lookup: {
    //       from: "orders",
    //       localField: "order_id",
    //       foreignField: "_id",
    //       as: "order",
    //     },
    //   },
    //   { $unwind: "$order" },
    //   {
    //     $match: {
    //       "order.emp_id": { $in: all_emp_data.map((emp) => emp._id) },
    //       "order.order_date": {
    //         $in: productiveMarketVisitData.map((visit) => visit.visit_date),
    //       },
    //       category_id: { $in: categoryIds },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$category_id",
    //       sub_total_price: { $sum: "$sub_total_price" },
    //     },
    //   },
    // ];

    // console.log('orderItemDataQuery:', orderItemDataQuery);

    // const orderItemData = await OrderItem.aggregate(orderItemDataQuery);

    // console.log('orderItemData:', orderItemData);

    // const catagorySaleAmounts = catagoryData.map((catagory) => {
    //   const categoryId = catagory._id.toString();
    //   let saleAmount = 0;

    //   for (const empData of all_emp_data) {
    //     const key = `${empData._id}`;

    //     if (groupedVisits[key]) {
    //       for (const visit of groupedVisits[key]) {
    //         const visitDate = visit.visit_date;

    //         const matchingOrderItem = orderItemData.find(
    //           (item) =>
    //             item._id.toString() === categoryId.toString() &&
    //             item.order._id.toString() === visit.order._id.toString() &&
    //             item.order.emp_id.toString() === empData._id.toString() &&
    //             item.order.order_date.getTime() === visitDate.getTime()
    //         );

    //         if (matchingOrderItem) {
    //           saleAmount += matchingOrderItem.sub_total_price;
    //         }
    //       }
    //     }
    //   }

    //   return {
    //     catagory_name: catagory.name,
    //     catagory_sale_amount: saleAmount,
    //   };
    // });


    // const catagory_data = await ProductCatagory.find({ company_id }).limit(5 * 1);

    // const catagory_wise_sec_sale = await Promise.all(
    //   catagory_data.map(async (catagory) => {
    //     let emp_wise_cat_sale_amount = 0;

    //     for (let i = 0; i < all_emp_data.length; i++) {
    //       const productive_market_visit_data = await Visit.find({
    //         emp_id: all_emp_data[i]._id,
    //         visit_date: new RegExp(current_year_regex),
    //         visit_status: "Completed",
    //         order_status: "Productive",
    //       });
    //       // console.log('productive_market_visit_data----',productive_market_visit_data.length);
    //       if (productive_market_visit_data.length > 0) {
    //         const empIds = all_emp_data.map((emp) => emp._id);

    //         const emp_cat_wise_order_data = await Order.find({
    //           emp_id: { $in: empIds },
    //           order_date: { $in: productive_market_visit_data.map((visit) => visit.visit_date) },
    //         });
    //         // console.log('emp_cat_wise_order_data----',emp_cat_wise_order_data.length);
    //         for (let l = 0; l < emp_cat_wise_order_data.length; l++) {
    //           const order_item_data = await OrderItem.find({ order_id: emp_cat_wise_order_data[l]._id });

    //           for (let m = 0; m < order_item_data.length; m++) {
    //             if (order_item_data[m].catagory_id == catagory._id) {
    //               console.log('inside if',order_item_data[m].sub_total_price);
    //               emp_wise_cat_sale_amount += parseInt(order_item_data[m].sub_total_price);
    //             }
    //           }
    //         }
    //       }
    //     }
    //     let x = {
    //       catagory_name: catagory.name,
    //       catagory_sale_amount: emp_wise_cat_sale_amount,
    //     };
    //     console.log('x----',x);
    //     return x
    //   })
    // );
    let data = {
      market_visits: list,
      total_tc: total_tc,
      total_pc: total_pc,
      total_nc: total_nc,
      total_sale: total_sale,
      catagory_wise_sec_sale: catagory_wise_sec_sale,
    }
    return res.json({ status: true, message: "YTD Team dashboard", result: data })
  } else {
    return res.json({ status: false, message: "Please check the screen type", result: {} })
  }
})

// router.get('/get_team_employees',async (req,res)=>{
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     return res.json({
//       status: false,
//       message: "Token must be provided"
//     })
//   }
//   var decodedToken = jwt.verify(token, "test");
//   var employee_id = decodedToken.user_id;
//   let emp_data = await Employee.findOne({ _id: employee_id });
//   if(!emp_data) return res.json({status:false,message:"No Employee",result:[]})
//   let company_id = emp_data.companyId;

//   if(team_data.length<1) return res.json({status:true,message:"No Team Employee",result:[]})
//   if(team_data.length>0) return res.json({status:true,message:"Team Employee",result:team_data})
// })

router.get("/get_team_employees", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  if (!emp_data) return res.json({ status: false, message: "No Employee", result: [] })
  let company_id = emp_data.companyId;
  Role.findOne({ _id: emp_data.roleId }).exec().then(async (role_data) => {
    if (!role_data) {
      return res.json({
        status: true,
        message: "No Role found",
        result: [],
      });
    }
    var hierarchy_level = parseInt(role_data.hierarchy_level);
    console.log('hierarchy_level------', hierarchy_level)
    var role_new_data = await Role.find({ company_id });
    var role_id_array = [];
    role_new_data.forEach((r_data) => {
      if (r_data.hierarchy_level > hierarchy_level) {
        role_id_array.push(r_data._id);
      }
    });
    Employee.find({ $and: [{ roleId: { $in: role_id_array } }, { companyId: company_id }] }).exec().then((team_data) => {
      if (team_data.length < 1) {
        res.json({
          status: true,
          message: "No team found",
          result: [],
        });
      } else {
        res.json({
          status: true,
          message: "Team found",
          result: team_data,
        });
      }
    });
  });

});

router.get('/salary-slip', async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var employeeId = decodedToken.user_id;
    console.log(employeeId)
    // Fetch employee details from the database
    const employee = await Employee.findById({ _id: employeeId });
    const comapany_data = await Admin.findOne({ _id: employee.companyId })
    // const folder = `${PROJECT_DIR}/images/salary_slip`
    // console.log(`Path -----during download ${folder}`);
    // Create a new PDF document
    const doc = new PDFDocument();

    // Set PDF properties
    doc.fontSize(20).text('Salary Slip', { align: 'center' });
    doc.moveDown();

    // Add employee details
    doc.fontSize(14)
      .text(`Company Name: ${comapany_data.company_name}`)
      .text(`Employee Code: ${employee.company_code}${employee.employee_code}`)
      .text(`Name: ${employee.employeeName}`)
      .moveDown();

    // Add salary details
    doc.fontSize(16).text('Salary Details:', { underline: true }).moveDown();
    doc.fontSize(12).text(`Basic Salary: ${employee.userExpenses ? employee.userExpenses.salaryAll : ""}`);
    doc.fontSize(12).text(`TA: ${employee.userExpenses ? employee.userExpenses.TAKM : ""}`);
    doc.fontSize(12).text(`DA: ${employee.userExpenses ? employee.userExpenses.DA : ""}`);
    doc.moveDown();
    const filename = `${PROJECT_DIR}/images/salary_slip/salary_slip_${employeeId}.pdf`;
    // console.log('directory name----------',PROJECT_DIR)
    doc.pipe(fs.createWriteStream(filename));
    doc.end();
    let result = fs.createReadStream(filename)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary_slip_${employeeId}.pdf`);
    // res.sendFile(result)
    result.pipe(res);




  } catch (err) {
    console.log("err=", err)
    res.status(500).send('Error generating salary slip.');
  }
});


module.exports = router;