const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const jwt = require("jsonwebtoken");
const goodReturnVoucherModel = require("../../models/goodReturnVoucherModel");
const Employee = mongoose.model("Employee");
const Party = mongoose.model("Party");
const PartyType = mongoose.model("PartyType");
const PartyGrouping = mongoose.model("PartyGrouping");
const Mapping = mongoose.model("Mapping");
const Role = mongoose.model("role");
const Location = mongoose.model("Location");
const Retailer = mongoose.model("Retailer");
const Order = mongoose.model("Order");
const OrderItem = mongoose.model("OrderItem");
const PrimaryOrder = mongoose.model("PrimaryOrder");
const PaymentCollection = mongoose.model("PaymentCollection");
const EmployeeTarget = mongoose.model("EmployeeTarget");
const CustomerType = mongoose.model("CustomerType");
const SalesReport = mongoose.model("SalesReport");
const Attendance = mongoose.model("Attendance");
const ExpenseReport = mongoose.model("ExpenseReport");
const Stock = mongoose.model("Stock");
const StockItem = mongoose.model("StockItem");
const Visit = mongoose.model("Visit");
const Leave = mongoose.model("Leave");
const Route = mongoose.model("Route");
const Beat = mongoose.model("Beat");
const Check = mongoose.model("Check");
const NightStay = mongoose.model("NightStay");
const Product = mongoose.model("Product");
const Tracking = mongoose.model("Tracking");
const Admin = mongoose.model("AdminInfo");
const Claim = mongoose.model("Claim");
const VoucherGoodsReturn = mongoose.model("VoucherGoodsReturn");
const DetailedGoodsReturn = mongoose.model("DetailedGoodsReturn");
const DetailedGoodsReturnItem = mongoose.model("DetailedGoodsReturnItem");
const PrimaryOrderItem = mongoose.model("PrimaryOrderItem");
const Invoice = mongoose.model("Invoice");
const Feedback = mongoose.model("Feedback");
const PriceList = mongoose.model("PriceList");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/secondary_order_report', async (req, res) => {
  let beat_id = req.body.beat_id ? req.body.beat_id : "";
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let arr = []
  let list = []
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ order_date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ order_date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ order_date: { $gte: start_date, $lte: date } })
  }
  console.log(arr);
  if (beat_id != "") arr.push({ beat_id })
  if (employee_id != "") arr.push({ emp_id: employee_id })
  let emp_data = await Employee.findOne({ _id: employee_id })
  if (!emp_data) return res.json({ status: false, message: "No data" })
  let pdf_state_data = await Location.findOne({ id: emp_data.headquarterState });
  let pdf_city_data = await Location.findOne({ id: emp_data.headquarterCity });
  let pdf_role_data = await Role.findOne({ _id: emp_data.roleId });
  let order_data = await Order.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  let total_order_data = await Order.find({ $and: arr });
  let total_orders = total_order_data.length;
  let pending_order = 0;
  let delivered_orders = 0;
  let cancelled_order = 0;
  let total_amount = 0;
  let count = await Order.find({ $and: arr });
  for (let i = 0; i < order_data.length; i++) {
    if (order_data[i].delivery_status == "Pending") {
      pending_order++;
    }
    if (order_data[i].delivery_status == "Delivered") {
      delivered_orders++;
    }
    console.log(i);
    let retailer_data = await Retailer.findOne({ _id: order_data[i].retailer_id })
    let employee_data = await Employee.findOne({ _id: order_data[i].emp_id })
    if (order_data[i].beat_id) {
      var beat_data = await Beat.findOne({ _id: order_data[i].beat_id })
    }
    let custumer_type_data = await CustomerType.findOne({ _id: retailer_data.customer_type })
    total_amount += Number(order_data[i].total_amount)
    let u_data = {
      order_id: order_data[i]._id,
      retailer: retailer_data.firmName,
      retailer_id: retailer_data._id,
      order_date: order_data[i].order_date,
      total_amount: order_data[i].total_amount,
      order_status: order_data[i].order_status,
      beat_name: beat_data ? beat_data.beatName : '',
      delivery_status: order_data[i].delivery_status,
      order_by: employee_data.employeeName,
      customer_type: custumer_type_data.customer_type
    }
    list.push(u_data)
  }

  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let pdf_emp_name = emp_data.employeeName;
  let pdf_emp_role = pdf_role_data?.rolename || '';
  let pdf_emp_code = `${emp_data.company_code}${emp_data.employee_code}`
  let pdf_emp_city = pdf_city_data?.name || '';
  let pdf_emp_state = pdf_state_data?.name || '';
  return res.json({
    status: true,
    message: "Secondary orders",
    result: {
      list: list,
      count: count.length,
      cancelled_order,
      total_orders,
      pending_order,
      delivered_orders,
      pdf_start_date,
      pdf_end_date,
      pdf_emp_name,
      pdf_emp_role,
      pdf_emp_code,
      pdf_emp_city,
      pdf_emp_state,
      pdf_total_amount: total_amount,
    },
    pageLength: Math.ceil(count.length / limit),
  })
})

router.post('/getAllRetailers', async (req, res) => {
  let arr = [];
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let state = req.body.state ? req.body.state : "";
  let search = req.body.search ? req.body.search : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  // let beat_id = req.body.beat_id ? req.body.beat_id : "";
  // let list = []
  arr.push({ company_id })
  if (search != "") {
    var regex = new RegExp(search, 'i');
    arr.push({ firmName: regex })
  }
  // if(beat_id!=""){
  //   let beat_data = await Beat.findOne({_id:beat_id});
  //   list = beat_data.route;
  // }
  if (state != "") arr.push({ state: state });
  // if(list.length >0){
  //   console.log('inside list.length--');
  //   arr.push({route_id:{$in:{list}}})
  // }
  console.log('arr----', arr);
  let count = await Retailer.find({ $and: arr })
  Retailer.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit).exec().then(async (retailer_data) => {
    if (retailer_data.length < 1) {
      return res.json({
        status: true,
        message: "No retailers found",
        result: []
      })
    } else {
      let list = [];
      let countInfo = 0;
      for (let i = 0; i < retailer_data.length; i++) {
        var route_data = await Route.findOne({ _id: retailer_data[i].route_id });
        var city_data = await Location.findOne({ id: route_data.city });
        var customer_type = await CustomerType.findOne({ _id: retailer_data[i].customer_type })
        await (async function (rowData) {
          let data = {
            id: rowData._id,
            customer_type: customer_type.customer_type,
            company_id: rowData.company_id,
            firmName: rowData.firmName,
            GSTNo: rowData.GSTNo,
            customerName: rowData.customerName,
            route: route_data.route_name,
            beat: '',
            city: city_data?.name || '',
            lat: rowData.lat,
            date: rowData.date || '',
            long: rowData.long,
            mobileNo: rowData.mobileNo,
            status: rowData.status,
          }
          list.push(data)
        })(retailer_data[i])
        countInfo++
        if (countInfo == retailer_data.length) {
          return res.json({ status: true, message: "Retailers found successfully", result: list, pageLength: Math.ceil(count.length / limit), count: count.length })
        }
      }
    }
  })
})

router.post('/primary_order_reports', async (req, res) => {
  console.log("req.body primary_order_reports ------------------------------->", req.body)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  // let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let type = req.body.type ? req.body.type : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let pdf_employee_name = "All Employee";
  let pdf_party_name = "All Parties";
  let pdf_state_name = "All States";
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let arr = [{ company_id }]
  let list = []
  let date = get_current_date().split(" ")[0];
  if (type != "") arr.push({ supply_by: type })
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ date: { $gte: start_date, $lte: date } })
  }
  if (party_id != "") {
    arr.push({ party_id })
    let party_data = await Party.findOne({ _id: party_id });
    let state_data = await Location.findOne({ id: party_data.state })
    pdf_party_name = party_data.firmName;
    pdf_state_name = state_data.name;
  }
  if (employee_id != "") {
    arr.push({ emp_id: employee_id })
    let employee_data = await Employee.findOne({ _id: employee_id });
    let state_data = await Location.findOne({ id: employee_data.state })
    pdf_employee_name = employee_data.employeeName;
    pdf_state_name = state_data.name;
  }
  // if (party_type_id != "") arr.push({ party_type_id })
  let primary_order_data = await PrimaryOrder.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  let count = await PrimaryOrder.find({ $and: arr });
  let total_orders = count.length;
  let pending_order = 0;
  let delivered_orders = 0;
  let pdf_invoice_total = 0;
  let cancelled_orders = 0;
  let feed_by;
  let feed_by_id;
  for (let i = 0; i < primary_order_data.length; i++) {
    if (primary_order_data[i].delivery_status == "Pending") {
      pending_order++;
    }
    if (primary_order_data[i].delivery_status == "Delivered") {
      delivered_orders++;
    }
    let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
    let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
    let invoice_data = await Invoice.findOne({ order_id: primary_order_data[i]._id })
    let feed_by_data = await Mapping.findOne({ assigned_to_id: primary_order_data[i].party_id, primary_type: "SS", assigned_to_type: "Distributor" })
    if (feed_by_data) {
      let party = await Party.findOne({ _id: feed_by_data.primary_id })
      feed_by = party.firmName
      feed_by_id = party._id
    } else {
      let admin = await Admin.findOne({ _id: employee_data.companyId });
      feed_by = admin.company_name
      feed_by_id = admin._id
    }
    let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
    pdf_invoice_total += Number(invoice_data ? invoice_data.invoice_amount : 0);
    let u_data = {
      order_id: primary_order_data[i]._id,
      emp: employee_data.employeeName,
      party_type: party_type_data.party_type,
      party_type_id: party_type_data._id,
      order_date: primary_order_data[i].date,
      feed_by: feed_by,
      feed_by_id: feed_by_id,
      delivery_status: primary_order_data[i].delivery_status,
      party: party_data.firmName,
      party_id: party_data._id,
      total_amount: primary_order_data[i].total_amount,
      invoice_amount: invoice_data ? invoice_data.order_amount : 0,
      approval_status: primary_order_data[i].approval_status,
    }
    list.push(u_data)
  }
  return res.json({
    status: true,
    message: "Primary orders",
    result: {
      list: list,
      count: count.length,
      cancelled_orders: cancelled_orders,
      total_orders: total_orders,
      pending_order: pending_order,
      delivered_orders: delivered_orders,
      pdf_employee_name,
      pdf_party_name,
      pdf_state_name,
      pdf_start_date,
      pdf_end_date,
      pdf_invoice_total,
    },
    pageLength: Math.ceil(count.length / limit)
  })
})

router.post('/collection_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = 10;
  let list = []
  let arr = [{ company_id }]
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  }
  if (party_type_id != "") arr.push({ party_type_id })
  arr.push({ approval_status: "Approved" })
  if (party_id != "") arr.push({ party_id })
  let payment_collection_data = await PaymentCollection.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  let count = await PaymentCollection.find({ $and: arr });
  if (payment_collection_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < payment_collection_data.length; i++) {
    let party_type_data = await PartyType.findOne({ _id: payment_collection_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: payment_collection_data[i].party_id })
    let u_data = {
      party_type: party_type_data.party_type,
      party: party_data.firmName,
      payment_mode: payment_collection_data[i].payment_mode,
      date: payment_collection_data[i].date,
      amount: payment_collection_data[i].amount,
      approval_status: payment_collection_data[i].approval_status,
      id: payment_collection_data[i]._id
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "payment reports", result: list, pageLength: Math.ceil(count.length / limit) })
});

router.post('/collection_transaction', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_id = req.body.party_id ? req.body.party_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let arr = [{ company_id }]
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ date: { $gte: start_date, $lte: date } })
  }
  if (party_id != "") arr.push({ party_id });
  let payment_collection_data = await PaymentCollection.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  let count = await PaymentCollection.find({ $and: arr });
  if (payment_collection_data.length < 1) return res.json({ status: true, message: "No data found", result: [] })
  let total_collection_amount = 0;
  let total_approved_amount = 0;
  for (let i = 0; i < payment_collection_data.length; i++) {
    total_collection_amount += Number(payment_collection_data[i].amount)
    if (payment_collection_data[i].approved_amount != undefined) {
      total_approved_amount += Number(payment_collection_data[i].approved_amount)
    }
    let party_type_data = await PartyType.findOne({ _id: payment_collection_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: payment_collection_data[i].party_id })
    let emp_data = await Employee.findOne({ _id: payment_collection_data[i].employee_id })
    let u_data = {
      party_type: party_type_data.party_type,
      party: party_data.firmName,
      payment_mode: payment_collection_data[i].payment_mode,
      date: payment_collection_data[i].date,
      amount: payment_collection_data[i].amount,
      approval_status: payment_collection_data[i].approval_status,
      collected_by: emp_data.employeeName,
      id: payment_collection_data[i]._id
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "payment reports", result: list, count: count.length, pageLength: Math.ceil(count.length / limit), total_collection_amount: total_collection_amount, total_approved_amount: total_approved_amount })
})

router.post('/sales_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let employee_id = req.body.employee_id ? req.body.employee_id : ""
  let page = req.body.page ? req.body.page : "1";
  let limit = 10;
  let arr = [{ company_id }]
  if (employee_id != "") arr.push({ employee_id })
  let sales_report_data = await SalesReport.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await SalesReport.find({ $and: arr })
  if (sales_report_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  return res.json({ status: true, message: "Sales reports", result: sales_report_data, pageLength: Math.ceil(count.length / limit) })
})

router.post('/expense_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let employee_id = req.body.employee_id ? req.body.employee_id : ""
  let page = req.body.page ? req.body.page : "1"
  let start_date = req.body.start_date ? req.body.start_date : ""
  let end_date = req.body.end_date ? req.body.end_date : ""
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let arr = { company_id }
  let date = get_current_date().split(" ")[0]
  if (employee_id == "") {
    let emp_data = await Employee.find({ companyId: company_id, is_delete: "0" }).limit(limit * 1).skip((page - 1) * limit);
    var count = await Employee.countDocuments({ companyId: company_id, is_delete: "0" })
    console.log(count / Number(limit));
    if (emp_data.length < 1) return res.json({ status: false, message: "No data" })
    if (start_date == "" && end_date == "") {
      var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
      arr.for_what_date = new RegExp(current_regexDate)
    } else if (start_date != "" && end_date != "") {
      arr.for_what_date = { $gte: start_date, $lte: end_date }
    } else if (start_date != "" && end_date == "") {
      arr.for_what_date = { $gte: start_date, $lte: date }
    }
    var total_TA = 0;
    var total_DA = 0;
    var total_claim_amount = 0;
    var total_misc_amount = 0;
    var total_night_hault = 0;
    var travelled_distance = 0;
    var submitted_kms = 0;
    var approved_amount = 0;
    let pdf_employee_name = 'All Employee';
    let pdf_employee_state = 'All State';
    let pdf_employee_role = ' ';
    let pdf_employee_city = 'All City';
    let pdf_employee_id = ' ';
    let pdf_start_date = start_date;
    let pdf_end_date = end_date
    for (let j = 0; j < emp_data.length; j++) {
      arr.employee_id = emp_data[j]._id;
      arr.approval_status = "Approved"
      let expense_reports_data = await ExpenseReport.find(arr).limit(limit * 1).skip((page - 1) * limit)
      var final = {}
      if (expense_reports_data.length > 0) {
        let sub_total_TA = 0;
        let sub_total_DA = 0;
        let sub_total_misc_amount = 0;
        let sub_total_claim_amount = 0;
        let sub_total_night_hault = 0;
        let sub_travelled_distance = 0;
        let sub_device_kms = 0;
        let sub_approved_amount = 0;
        let sub_submitted_kms = 0;
        for (let i = 0; i < expense_reports_data.length; i++) {
          total_TA += Number(expense_reports_data[i].ta_amount)
          sub_total_TA += Number(expense_reports_data[i].ta_amount)
          total_DA += Number(expense_reports_data[i].da_amount)
          sub_total_DA += Number(expense_reports_data[i].da_amount)
          total_misc_amount += Number(expense_reports_data[i].misc_amount)
          sub_total_misc_amount += Number(expense_reports_data[i].misc_amount)
          total_claim_amount += Number(expense_reports_data[i].total_claim_amount)
          sub_total_claim_amount += Number(expense_reports_data[i].total_claim_amount)
          total_night_hault += Number(expense_reports_data[i].hotel)
          sub_total_night_hault += Number(expense_reports_data[i].hotel)
          travelled_distance += Number(expense_reports_data[i].travelled_distance)
          sub_travelled_distance += Number(expense_reports_data[i].travelled_distance)
          sub_device_kms += Number(expense_reports_data[i].device_kms)
          approved_amount += Number(expense_reports_data[i].approved_amount)
          sub_approved_amount += Number(expense_reports_data[i].approved_amount)
          submitted_kms += Number(expense_reports_data[i].travelled_distance)
          sub_submitted_kms += Number(expense_reports_data[i].travelled_distance)
        }
        let u_data = {
          emp_name: emp_data[j].employeeName,
          emp_id: emp_data[j]._id,
          sub_total_TA: sub_total_TA,
          sub_total_DA: sub_total_DA,
          // date: expense_reports_data[i].for_what_date,
          sub_total_misc_amount: sub_total_misc_amount,
          sub_total_claim_amount: sub_total_claim_amount,
          sub_total_night_hault: sub_total_night_hault,
          sub_travelled_distance: sub_travelled_distance,
          sub_device_kms: Math.ceil(sub_device_kms),
          sub_approved_amount: sub_approved_amount,
          sub_submitted_kms: sub_submitted_kms,
        }
        list.push(u_data)
      } else {
        let u_data = {
          emp_name: emp_data[j].employeeName,
          emp_id: emp_data[j]._id,
          sub_total_TA: '-',
          sub_total_DA: '-',
          sub_total_misc_amount: '-',
          sub_total_claim_amount: '-',
          sub_total_night_hault: '-',
          sub_travelled_distance: '-',
          sub_device_kms: '-',
          sub_approved_amount: '-',
          sub_submitted_kms: '-',
        }
        list.push(u_data)
      }
    }
    return res.json({
      status: true, message: "Expense reports", result: {
        list: list,
        total_TA: total_TA,
        approved_amount: approved_amount,
        total_DA: total_DA,
        total_misc_amount: total_misc_amount,
        total_claim_amount: total_claim_amount,
        total_night_hault: total_night_hault,
        travelled_distance: travelled_distance
      },
      count: count,
      pageLength: Math.ceil(count / Number(limit)),
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_id,
      pdf_start_date,
      pdf_end_date,
    })
  } else if (employee_id != "") {
    let emp_data = await Employee.findOne({ _id: employee_id, is_delete: "0" });
    if (!emp_data) return res.json({ status: false, message: "No data" })
    if (start_date == "" && end_date == "") {
      var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
      arr.for_what_date = new RegExp(current_regexDate)
    } else if (start_date != "" && end_date != "") {
      // var current_regexDate = `${year}-${month}-?[0-9]*`
      arr.for_what_date = { $gte: start_date, $lte: end_date }
    }
    // if (date != "") arr.for_what_date = date
    arr.employee_id = emp_data._id;
    arr.approval_status = "Approved"
    let expense_reports_data = await ExpenseReport.find(arr).sort({ for_what_date: -1 }).limit(limit * 1).skip((page - 1) * limit)
    var count = await ExpenseReport.find(arr)
    var final = {}
    let state_data = await Location.findOne({ id: emp_data.headquarterState })
    let city_data = await Location.findOne({ id: emp_data.headquarterCity })
    let role_data = await Role.findOne({ _id: emp_data.roleId })
    let pdf_employee_name = emp_data.employeeName;
    let pdf_employee_state = state_data.name;
    let pdf_employee_role = role_data?.roleName;
    let pdf_employee_city = city_data.name;
    let pdf_employee_unique_id = `${emp_data.company_code}${emp_data.employee_code}`;
    let pdf_start_date = start_date;
    let pdf_end_date = end_date
    if (expense_reports_data.length > 0) {
      console.log('inside', expense_reports_data.length);
      var total_TA = 0;
      let sub_total_TA = 0;
      var total_DA = 0;
      let sub_total_DA = 0;
      var total_misc_amount = 0;
      let sub_total_misc_amount = 0;
      var total_claim_amount = 0;
      let sub_total_claim_amount = 0;
      var total_night_hault = 0;
      let sub_total_night_hault = 0;
      var travelled_distance = 0;
      let sub_travelled_distance = 0;
      var approved_amount = 0;
      let sub_approved_amount = 0;
      var submitted_kms = 0;
      let sub_submitted_kms = 0;
      var device_kms = 0;
      let sub_device_kms = 0;
      for (let i = 0; i < expense_reports_data.length; i++) {
        let attandance_data = await Attendance.findOne({ emp_id: employee_id, date2: expense_reports_data[i].for_what_date })
        if (attandance_data) {
          var beat_data = await Beat.findOne({ _id: attandance_data.beat_id })
        }
        total_TA += Number(expense_reports_data[i].ta_amount)
        sub_total_TA = Number(expense_reports_data[i].ta_amount)
        total_DA += Number(expense_reports_data[i].da_amount)
        sub_total_DA = Number(expense_reports_data[i].da_amount)
        total_misc_amount += Number(expense_reports_data[i].misc_amount)
        sub_total_misc_amount = Number(expense_reports_data[i].misc_amount)
        total_claim_amount += Number(expense_reports_data[i].total_claim_amount)
        sub_total_claim_amount = Number(expense_reports_data[i].total_claim_amount)
        total_night_hault += Number(expense_reports_data[i].hotel)
        sub_total_night_hault = Number(expense_reports_data[i].hotel)
        travelled_distance += Number(expense_reports_data[i].travelled_distance)
        sub_travelled_distance = Number(expense_reports_data[i].travelled_distance)
        approved_amount += Number(expense_reports_data[i].approved_amount)
        sub_approved_amount = Number(expense_reports_data[i].approved_amount)
        device_kms += Number(expense_reports_data[i].device_kms)
        sub_device_kms = Number(expense_reports_data[i].device_kms)
        submitted_kms += Number(expense_reports_data[i].travelled_distance)
        sub_submitted_kms = Number(expense_reports_data[i].travelled_distance)
        let u_data = {
          date: expense_reports_data[i].for_what_date,
          attachment: expense_reports_data[i].attachment,
          beat_name: beat_data ? beat_data.beatName : "",
          report_id: expense_reports_data[i]._id,
          approval_status: expense_reports_data[i].approval_status,
          sub_total_TA: sub_total_TA,
          from_location: expense_reports_data[i].from_location || '',
          to_location: expense_reports_data[i].to_location || '',
          sub_total_DA: sub_total_DA,
          sub_total_misc_amount: sub_total_misc_amount,
          sub_total_claim_amount: sub_total_claim_amount,
          sub_total_night_hault: sub_total_night_hault,
          sub_travelled_distance: sub_travelled_distance,
          sub_approved_amount: sub_approved_amount,
          sub_device_kms: Math.ceil(sub_device_kms),
          sub_submitted_kms: sub_submitted_kms,
        }
        list.push(u_data)
      }
    }

    return res.json({
      status: true,
      message: "Expense reports",
      result: {
        list: list,
        total_misc_amount: total_misc_amount,
        approved_amount: approved_amount,
        total_TA: total_TA,
        total_DA: total_DA,
        total_claim_amount: total_claim_amount,
        travelled_distance: travelled_distance,
        calculated_distance: Math.ceil(device_kms),
        total_night_hault: total_night_hault
      },
      count: count.length,
      pageLength: Math.ceil(count.length / limit),
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_unique_id,
      pdf_start_date,
      pdf_end_date,
    })
  }
})

router.post('/expense_transaction', async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let page = req.body.page ? req.body.page : "1"
  let start_date = req.body.start_date ? req.body.start_date : ""
  let end_date = req.body.end_date ? req.body.end_date : ""
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let arr = {}
  let date = get_current_date().split(" ")[0]
  let emp_data = await Employee.findOne({ _id: employee_id, is_delete: "0" });
  if (!emp_data) return res.json({ status: false, message: "No data" })
  let pdf_state_data = await Location.findOne({ id: emp_data.headquarterState });
  let pdf_city_data = await Location.findOne({ id: emp_data.headquarterCity });
  let pdf_role_data = await Role.findOne({ _id: emp_data.roleId });
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let pdf_emp_name = emp_data.employeeName;
  let pdf_emp_role = pdf_role_data?.rolename || '';
  let pdf_emp_code = `${emp_data.company_code}${emp_data.employee_code}`
  let pdf_emp_city = pdf_city_data?.name || '';
  let pdf_emp_state = pdf_state_data?.name || '';
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.for_what_date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    arr.for_what_date = { $gte: start_date, $lte: end_date }
  } else if (start_date != "" && end_date == "") {
    arr.for_what_date = { $gte: start_date, $lte: date }
  }
  arr.employee_id = emp_data._id;
  let expense_reports_data = await ExpenseReport.find(arr).sort({ for_what_date: -1 }).limit(limit * 1).skip((page - 1) * limit)
  var count = await ExpenseReport.find(arr)
  var final = {}
  if (expense_reports_data.length > 0) {
    console.log('inside', expense_reports_data.length);
    var total_TA = 0;
    let sub_total_TA = 0;
    var total_DA = 0;
    let sub_total_DA = 0;
    var total_misc_amount = 0;
    let sub_total_misc_amount = 0;
    var total_claim_amount = 0;
    let sub_total_claim_amount = 0;
    var total_night_hault = 0;
    let sub_total_night_hault = 0;
    var travelled_distance = 0;
    let sub_travelled_distance = 0;
    var approved_amount = 0;
    let sub_approved_amount = 0;
    var submitted_kms = 0;
    let sub_submitted_kms = 0;
    var device_kms = 0;
    let sub_device_kms = 0;
    for (let i = 0; i < expense_reports_data.length; i++) {
      let attandance_data = await Attendance.findOne({ emp_id: employee_id, date2: expense_reports_data[i].for_what_date })
      if (attandance_data) {
        var beat_data = await Beat.findOne({ _id: attandance_data.beat_id })
      }
      total_TA += Number(expense_reports_data[i].ta_amount)
      sub_total_TA = Number(expense_reports_data[i].ta_amount)
      total_DA += Number(expense_reports_data[i].da_amount)
      sub_total_DA = Number(expense_reports_data[i].da_amount)
      total_misc_amount += Number(expense_reports_data[i].misc_amount)
      sub_total_misc_amount = Number(expense_reports_data[i].misc_amount)
      total_claim_amount += Number(expense_reports_data[i].total_claim_amount)
      sub_total_claim_amount = Number(expense_reports_data[i].total_claim_amount)
      total_night_hault += Number(expense_reports_data[i].hotel)
      sub_total_night_hault = Number(expense_reports_data[i].hotel)
      travelled_distance += Number(expense_reports_data[i].travelled_distance)
      sub_travelled_distance = Number(expense_reports_data[i].travelled_distance)
      approved_amount += Number(expense_reports_data[i].approved_amount)
      sub_approved_amount = Number(expense_reports_data[i].approved_amount)
      submitted_kms += Number(expense_reports_data[i].travelled_distance)
      sub_submitted_kms = Number(expense_reports_data[i].travelled_distance)
      device_kms += Number(expense_reports_data[i].device_kms)
      sub_device_kms = Number(expense_reports_data[i].device_kms)
      let u_data = {
        date: expense_reports_data[i].for_what_date,
        attachment: expense_reports_data[i].attachment,
        beat_name: beat_data ? beat_data.beatName : "",
        report_id: expense_reports_data[i]._id,
        approval_status: expense_reports_data[i].approval_status,
        from_location: expense_reports_data[i].from_location || '',
        to_location: expense_reports_data[i].to_location || '',
        sub_total_TA: sub_total_TA,
        sub_total_DA: sub_total_DA,
        sub_total_misc_amount: sub_total_misc_amount,
        sub_total_claim_amount: sub_total_claim_amount,
        sub_total_night_hault: sub_total_night_hault,
        sub_travelled_distance: sub_travelled_distance,
        sub_approved_amount: sub_approved_amount,
        sub_submitted_kms: sub_submitted_kms,
        sub_device_kms: Math.ceil(sub_device_kms),
      }
      list.push(u_data)
    }
  }

  return res.json({
    status: true,
    message: "Expense reports",
    result: {
      list: list,
      total_misc_amount,
      approved_amount,
      total_TA: total_TA,
      total_DA: total_DA,
      total_claim_amount,
      travelled_distance,
      calculated_distance: 0,
      total_night_hault,
      pdf_start_date,
      pdf_end_date,
      pdf_emp_name,
      pdf_emp_role,
      pdf_emp_code,
      pdf_emp_city,
      pdf_emp_state
    },
    count: count.length,
    pageLength: Math.ceil(count.length / limit)
  })
})

router.post('/distributor_current_stock', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_id = req.body.party_id ? req.body.party_id : "";
  let list = []
  let arr = [{ company_id }]
  if (party_id != "") arr.push({ party_id })
  if (party_id != "") {
    let stock_data = await Stock.findOne({ $and: arr }).sort({ date: -1 })
    if (!stock_data) return res.json({ status: true, message: "No data", result: [] })
    let stock_item_data = await StockItem.find({ stock_id: stock_data._id })
    let total_amount = 0;
    for (let i = 0; i < stock_item_data.length; i++) {
      total_amount += parseInt(stock_item_data[i].sub_total_price)
      let product_data = await Product.findOne({ _id: stock_item_data[i].product_id })
      let u_data = {
        product_name: product_data.productName,
        product_price: stock_item_data[i].product_price,
        product_quantity: stock_item_data[i].quantity,
        sub_total: stock_item_data[i].sub_total_price,
        date: stock_data.date
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Stock data", result: { list: list, total_amount: total_amount } })
  } else {
    let page = req.body.page ? req.body.page : "1";
    let limit = 10;
    let party_data = await Party.find({ company_id }).limit(limit * 1).skip((page - 1) * limit)
    let count = await Party.countDocuments({ company_id });
    let total_amount = 0;
    for (let i = 0; i < party_data.length; i++) {
      let stock_data = await Stock.findOne({ party_id: party_data[i]._id }).sort({ date: -1 })
      if (stock_data) {
        total_amount += parseInt(stock_data.total_amount)
      }
      let party_type_data = await PartyType.findOne({ _id: party_data[i].partyType })
      u_data = {
        party_name: party_data[i].firmName,
        party_id: party_data[i]._id,
        party_type: party_type_data.party_type,
        amount: stock_data ? stock_data.total_amount : "NA",
      }
      list.push(u_data)
    }
    return res.json({ status: true, message: "Stock data", result: { list: list, total_amount: total_amount }, pageLength: Math.ceil(count / limit) })
  }
})

router.post('/customer_visit_report', async (req, res) => {
  let list = []
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let order_status = req.body.order_status ? req.body.order_status : "";
  let date = get_current_date().split(" ")[0];
  let x = {}
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    x = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    x = { $gte: start_date, $lte: end_date }
  } else if (start_date != "" && end_date == "") {
    x = { $gte: start_date, $lte: date }
  }
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let beat_id = req.body.beat_id ? req.body.beat_id : "";
  if (employee_id != "") {
    let emp_data = await Employee.findOne({ _id: employee_id })
    let state_data = await Location.findOne({ id: emp_data.headquarterState })
    let city_data = await Location.findOne({ id: emp_data.headquarterCity })
    let role_data = await Role.findOne({ _id: emp_data.roleId })
    let pdf_employee_name = emp_data.employeeName;
    let pdf_employee_state = state_data?.name || '';
    let pdf_employee_role = role_data?.roleName || '';
    let pdf_employee_city = city_data?.name || '';
    let pdf_employee_unique_id = `${emp_data.company_code}${emp_data.employee_code}`;
    let pdf_start_date = start_date;
    let pdf_end_date = end_date
    let tc = 0
    let pc = 0
    let npc = 0
    let final_amount = 0
    let count = 0
    if (!order_status) {
      if (beat_id != "") {
        var visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id });
        var v_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id }).limit(limit * 1).skip((page - 1) * limit);
        var productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var non_productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });

      } else {
        var visit_data = await Visit.find({ visit_date: x, emp_id: employee_id });
        var v_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id }).limit(limit * 1).skip((page - 1) * limit);
        var productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var non_productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });

      }
      tc = visit_data.length;
      count = visit_data.length;
      pc = productive_visit_data.length;
      npc = non_productive_visit_data.length;
      let party_data = await Party.find({ company_id: emp_data.companyId });
      for (let i = 0; i < v_visit_data.length; i++) {
        let total_order_sum = 0;
        let all_order_details = await Order.find({ retailer_id: v_visit_data[i].retailer_id, order_date: v_visit_data[i].visit_date });
        for (let a = 0; a < all_order_details.length; a++) {
          total_order_sum += parseInt(all_order_details[a].total_amount);
        }
        final_amount += total_order_sum;
        let beat_data = await Beat.findOne({ _id: v_visit_data[i].beat_id })
        let retailer_data = await Retailer.findOne({ _id: v_visit_data[i].retailer_id });
        let dealer_name = "";
        for (let b = 0; b < party_data.length; b++) {
          for (let c = 0; c < party_data[b].route.length; c++) {
            if (party_data[b].route[c] == retailer_data.route_id) {
              dealer_name = party_data[b].firmName;
              break
            }
          }
          if (dealer_name != "") {
            break
          }
        }
        let u_data = {
          beat: { id: beat_data._id, beat_name: beat_data.beatName },
          retailer: { id: retailer_data._id, retailer_name: retailer_data.customerName },
          visit_date: v_visit_data[i].visit_date,
          time: v_visit_data[i].Updated_date,
          visit_status: v_visit_data[i].visit_status,
          order_status: v_visit_data[i].order_status,
          dealer_name: dealer_name,
          phone: retailer_data.mobileNo,
          amount: total_order_sum,
        }
        list.push(u_data)
      }
    } else if (order_status == "Productive") {
      if (beat_id != "") {
        var visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id });
        var productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var v_productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" }).limit(limit * 1).skip((page - 1) * limit);
        var non_productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });

      } else {
        var visit_data = await Visit.find({ visit_date: x, emp_id: employee_id });
        var productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var v_productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" }).limit(limit * 1).skip((page - 1) * limit);
        var non_productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });

      }
      tc = visit_data.length;
      pc = productive_visit_data.length;
      count = productive_visit_data.length;
      npc = non_productive_visit_data.length;
      let party_data = await Party.find({ company_id: emp_data.companyId });
      for (let i = 0; i < v_productive_visit_data.length; i++) {
        let total_order_sum = 0;
        let all_order_details = await Order.find({ retailer_id: v_productive_visit_data[i].retailer_id, order_date: v_productive_visit_data[i].visit_date });
        for (let a = 0; a < all_order_details.length; a++) {
          total_order_sum += parseInt(all_order_details[a].total_amount);
        }
        final_amount += total_order_sum;
        let beat_data = await Beat.findOne({ _id: v_productive_visit_data[i].beat_id })
        let retailer_data = await Retailer.findOne({ _id: v_productive_visit_data[i].retailer_id });
        let dealer_name = "";
        for (let b = 0; b < party_data.length; b++) {
          for (let c = 0; c < party_data[b].route.length; c++) {
            if (party_data[b].route[c] == retailer_data.route_id) {
              dealer_name = party_data[b].firmName;
              break
            }
          }
          if (dealer_name != "") {
            break
          }
        }
        let u_data = {
          beat: { id: beat_data._id, beat_name: beat_data.beatName },
          retailer: { id: retailer_data._id, retailer_name: retailer_data.customerName },
          visit_date: v_productive_visit_data[i].visit_date,
          time: v_productive_visit_data[i].Updated_date,
          visit_status: v_productive_visit_data[i].visit_status,
          order_status: v_productive_visit_data[i].order_status,
          dealer_name: dealer_name,
          phone: retailer_data.mobileNo,
          amount: total_order_sum,
        }
        list.push(u_data)
      }
    } else if (order_status == "Non-Productive") {
      if (beat_id != "") {
        var visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id });
        var productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var non_productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });
        var v_non_productive_visit_data = await Visit.find({ beat_id, visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" }).limit(limit * 1).skip((page - 1) * limit);

      } else {
        var visit_data = await Visit.find({ visit_date: x, emp_id: employee_id });
        var productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Productive" });
        var non_productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" });
        var v_non_productive_visit_data = await Visit.find({ visit_date: x, emp_id: employee_id, visit_status: "Completed", order_status: "Non-Productive" }).limit(limit * 1).skip((page - 1) * limit);

      }
      tc = visit_data.length;
      pc = productive_visit_data.length;
      npc = non_productive_visit_data.length;
      count = non_productive_visit_data.length;
      let party_data = await Party.find({ company_id: emp_data.companyId });
      for (let i = 0; i < v_non_productive_visit_data.length; i++) {
        let total_order_sum = 0;
        let all_order_details = await Order.find({ retailer_id: v_non_productive_visit_data[i].retailer_id, order_date: v_non_productive_visit_data[i].visit_date });
        for (let a = 0; a < all_order_details.length; a++) {
          total_order_sum += parseInt(all_order_details[a].total_amount);
        }
        final_amount += total_order_sum;
        let beat_data = await Beat.findOne({ _id: v_non_productive_visit_data[i].beat_id })
        let retailer_data = await Retailer.findOne({ _id: v_non_productive_visit_data[i].retailer_id });
        let dealer_name = "";
        for (let b = 0; b < party_data.length; b++) {
          for (let c = 0; c < party_data[b].route.length; c++) {
            if (party_data[b].route[c] == retailer_data.route_id) {
              dealer_name = party_data[b].firmName;
              break
            }
          }
          if (dealer_name != "") {
            break
          }
        }
        let u_data = {
          beat: { id: beat_data._id, beat_name: beat_data.beatName },
          retailer: { id: retailer_data._id, retailer_name: retailer_data.customerName },
          visit_date: v_non_productive_visit_data[i].visit_date,
          time: v_non_productive_visit_data[i].Updated_date,
          visit_status: v_non_productive_visit_data[i].visit_status,
          order_status: v_non_productive_visit_data[i].order_status,
          dealer_name: dealer_name,
          phone: retailer_data.mobileNo,
          amount: total_order_sum,
        }
        list.push(u_data)
      }
    }
    return res.json({
      status: true,
      message: "Customer visits of employee",
      result: {
        count: count,
        pageLength: Math.ceil(count / limit),
        list: list,
        tc: tc,
        pc: pc,
        npc: npc,
        pdf_employee_name,
        pdf_employee_state,
        pdf_employee_role,
        pdf_employee_city,
        pdf_employee_unique_id,
        pdf_start_date,
        pdf_end_date,
        final_amount: final_amount
      },
    })
  } else if (employee_id == "") {
    let list = []
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.json({
        status: false,
        message: "Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let emp_data = await Employee.find({ companyId: company_id, is_delete: "0" }).limit(limit * 1).skip((page - 1) * limit)
    let total_tc = 0
    let total_pc = 0
    let total_sales = 0
    let total_nc = 0
    let total_tbc = 0
    let total_ac = 0
    let total_uc = 0
    let pdf_total_tc = 0
    let pdf_total_pc = 0
    let pdf_total_sales = 0
    let pdf_total_nc = 0
    let pdf_total_tbc = 0
    let pdf_total_ac = 0
    let pdf_total_uc = 0
    let pdf_total_days = 0
    let pdf_employee_name = 'All Employee';
    let pdf_employee_state = 'All State';
    let pdf_employee_role = ' ';
    let pdf_employee_city = 'All City';
    let pdf_employee_id = ' ';
    let pdf_start_date = start_date;
    let pdf_end_date = end_date
    for (let j = 0; j < emp_data.length; j++) {
      let attendance_data = await Attendance.find({ emp_id: emp_data[j]._id, date2: x })
      // let sales_report_data = await SalesReport.find({ sales_report_date: new RegExp(current_regexDate), employee_id: emp_data[j]._id })
      let tc = 0
      let pc = 0
      let sales = 0
      let days = attendance_data.length
      pdf_total_days += attendance_data.length;
      let nc = 0
      let ac = 0
      let uc = 0
      let market_visit_data = await Visit.find({ emp_id: emp_data[j]._id, visit_status: "Completed", visit_date: x }).sort({ visit_date: -1 })
      if (attendance_data.length > 0) {
        for (let k = 0; k < attendance_data.length; k++) {
          let beat_data = await Beat.findOne({ _id: attendance_data[k].beat_id })
          let route_arr = beat_data.route;
          for (let i = 0; i < route_arr.length; i++) {
            let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date: attendance_data[k].date2 })
            nc += new_retailer_data.length;
            total_nc += new_retailer_data.length;
            pdf_total_nc += new_retailer_data.length;
          }
        }
      }
      for (let i = 0; i < market_visit_data.length; i++) {
        if (market_visit_data[i].visit_status == "Completed") {
          tc += 1
          total_tc += 1
          pdf_total_tc += 1
          if (market_visit_data[i].order_status == "Productive") {
            pc += 1
            total_pc += 1
            pdf_total_pc += 1
            let order_data = await Order.find({ emp_id: emp_data[j]._id, order_date: market_visit_data[i].visit_date, retailer_id: market_visit_data[i].retailer_id });
            if (order_data.length > 0) {
              for (let j = 0; j < order_data.length; j++) {
                sales += parseInt(order_data[j].total_amount);
                total_sales += parseInt(order_data[j].total_amount);
                pdf_total_sales += parseInt(order_data[j].total_amount);
              }
            }
          }
        }
      }
      let retailer_data = await Retailer.find({ employee_id: emp_data[j]._id })
      total_tbc += retailer_data.length
      pdf_total_tbc += retailer_data.length
      let u_data = {
        emp_name: emp_data[j].employeeName,
        emp_id: emp_data[j]._id,
        tc: tc,
        pc: pc,
        nc: nc,
        ac: 0,
        uc: 0,
        days: days,
        tbc: retailer_data.length,
        amount: sales
      }
      list.push(u_data)
    }
    let summary = {
      total_tc: total_tc,
      total_pc: total_pc,
      total_sales: total_sales,
      total_nc: total_nc,
      total_tbc: total_tbc,
      total_ac: total_ac,
      total_uc: total_uc,
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_id,
      pdf_start_date,
      pdf_end_date,
      pdf_total_tc,
      pdf_total_pc,
      pdf_total_sales,
      pdf_total_nc,
      pdf_total_tbc,
      pdf_total_ac,
      pdf_total_uc,
      pdf_total_days
    }
    return res.json({
      status: true,
      message: "Data",
      result: {
        list: list,
        summary: summary,
        count: emp_data.length,
        pageLength: Math.ceil(emp_data.length / limit)
      },
    })
  }
})

router.post('/claim_reports', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_id = req.body.party_id ? req.body.party_id : "";
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let list = []
  let arr = [{ company_id, approval_status: "Approved" }]
  if (party_id != "") arr.push({ party_id })
  if (party_type_id != "") arr.push({ party_type_id })
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.claim_date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    arr.claim_date = { $gte: start_date, $lte: end_date }
  }
  console.log(arr);
  let claim_data = await Claim.find({ $and: arr })
  console.log(claim_data);
  if (claim_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < claim_data.length; i++) {
    let party_type_data = await PartyType.findOne({ _id: claim_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: claim_data[i].party_id })
    let u_data = {
      party_type_id: party_type_data.party_type,
      party_id: party_data.firmName,
      claim_date: claim_data[i].claim_date,
      claim_amount: claim_data[i].claim_amount,
      claim_type: claim_data[i].claim_type,
      description: claim_data[i].description,
      document: claim_data[i].document,
      approval_status: claim_data[i].approval_status,
      approval_amount: claim_data[i].approval_amount,
      id: claim_data[i]._id,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Claim reports", result: list })
})

router.post('/claim_transaction', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_id = req.body.party_id ? req.body.party_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let limit = req.body.limit ? req.body.limit : 10;
  let page = req.body.page ? req.body.page : '1';
  let list = []
  let arr = { company_id }
  if (party_id != "") arr.party_id = party_id
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.claim_date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    arr.claim_date = { $gte: start_date, $lte: end_date }
  } else if (start_date != "" && end_date == "") {
    arr.claim_date = { $gte: start_date, $lte: date }
  }
  let claim_data = await Claim.find(arr).limit(limit * 1).skip((page - 1) * limit)
  let count = await Claim.find(arr)
  if (claim_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < claim_data.length; i++) {
    let party_type_data = await PartyType.findOne({ _id: claim_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: claim_data[i].party_id })
    let u_data = {
      party_type_id: party_type_data.party_type,
      party_id: party_data.firmName,
      claim_date: claim_data[i].claim_date,
      claim_amount: claim_data[i].claim_amount,
      claim_type: claim_data[i].claim_type,
      description: claim_data[i].description,
      document: claim_data[i].document,
      approval_status: claim_data[i].approval_status,
      approval_amount: claim_data[i].approved_amount || 0,
      id: claim_data[i]._id,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Claim reports", result: list, count: count.length, pageLength: Math.ceil(count.length / limit) })
})

router.post('/view_order', async (req, res) => {
  let order_id = req.body.order_id ? req.body.order_id : "";
  if (order_id == "") return res.json({ status: false, message: "Please give order_id" })
  let retailer_order_data = await Order.findOne({ _id: order_id });
  let emp_data = await Employee.findOne({ _id: retailer_order_data.emp_id })
  let retailer_data = await Retailer.findOne({ _id: retailer_order_data.retailer_id })
  if (retailer_data.state) {
    var state_data = await Location.findOne({ id: retailer_data.state })
  }
  let beat_data = await Beat.findOne({ _id: retailer_order_data.beat_id })
  let route_data = await Route.findOne({ _id: retailer_data.route_id })
  let order_item_data = await OrderItem.find({ order_id: retailer_order_data._id })
  let arr = []
  for (let i = 0; i < order_item_data.length; i++) {
    let product_data = await Product.findOne({ _id: order_item_data[i].product_id })
    console.log(product_data);
    let discount = order_item_data[i].discount || 0;
    let sub_total = Number(product_data.price) - (Number(product_data.price) * (discount / 100))
    let u_data = {
      product_name: product_data.productName,
      product_id: product_data._id,
      unit: product_data.packing_details,
      gst: product_data.gst,
      price: product_data.price,
      quantity: order_item_data[i].quantity,
      hsn_code: product_data.hsn_code,
      sub_total: sub_total || order_item_data[i].sub_total_price,
      discount: order_item_data[i].discount || 0,
      amount: Math.trunc(sub_total * Number(order_item_data[i].quantity))
    }
    arr.push(u_data)
  }
  console.log(arr);
  let total_amount = 0
  for (let i = 0; i < arr.length; i++) {
    total_amount += Number(arr[i].amount)
  }
  let data = {
    emp_id: emp_data._id,
    emp_name: emp_data.employeeName,
    order_id: order_id,
    company_id: emp_data.companyId,
    customer_name: retailer_data.firmName,
    amount: total_amount,
    state: state_data ? state_data.name : '',
    beat_name: beat_data.beatName,
    route_name: route_data.route_name,
    pay_amount: retailer_order_data.total_amount,
    phone: retailer_data.mobileNo,
    email: retailer_data.email ? retailer_data.email : '',
    date: retailer_order_data.order_date,
    details: arr,
  }
  return res.json({ status: true, message: "Data", result: data })
})

router.post('/goods_return_voucher_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = 10;
  let list = []
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let arr = [{ company_id }]
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.claim_date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    arr.claim_date = { $gte: start_date, $lte: end_date }
  }
  arr.push({ approval_status: "Approved" })
  if (party_type_id != "") arr.push({ party_type_id })
  if (party_id != "") arr.push({ party_id })
  let goods_return_voucher_data = await VoucherGoodsReturn.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await VoucherGoodsReturn.find({ $and: arr })
  if (goods_return_voucher_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < goods_return_voucher_data.length; i++) {
    let party_type_data = await PartyType.findOne({ _id: goods_return_voucher_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: goods_return_voucher_data[i].party_id })
    let u_data = {
      id: goods_return_voucher_data[i]._id,
      party_type: { id: party_type_data._id, name: party_type_data.party_type },
      party_id: { id: party_data._id, name: party_data.firmName },
      total_amount: goods_return_voucher_data[i].total_amount,
      net_amount: goods_return_voucher_data[i].net_amount,
      total_qty: goods_return_voucher_data[i].total_qty,
      depriciation: goods_return_voucher_data[i].depriciation,
      description: goods_return_voucher_data[i].description,
      photo: goods_return_voucher_data[i].photo,
      approval_status: goods_return_voucher_data[i].approval_status,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Goods return Vouchers", result: list, pageLength: Math.ceil(count.length / limit) })
})

router.post('/goods_return_voucher_transaction', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let arr = [{ company_id }]
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ date: { $gte: start_date, $lte: date } })
  }
  if (party_type_id != "") arr.push({ party_type_id })
  if (party_id != "") arr.push({ party_id })
  let goods_return_voucher_data = await VoucherGoodsReturn.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await VoucherGoodsReturn.find({ $and: arr })
  if (goods_return_voucher_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  let x;
  for (let i = 0; i < goods_return_voucher_data.length; i++) {
    let party_type_data = await PartyType.findOne({ _id: goods_return_voucher_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: goods_return_voucher_data[i].party_id })
    let emp_data = await Employee.findOne({ _id: goods_return_voucher_data[i].emp_id })
    let data = await Mapping.findOne({ assigned_to_id: goods_return_voucher_data[i].party_id, primary_type: "SS", assigned_to_type: "Distributor", })
    if (data) {
      let mapped_party_data = await Party.findOne({ _id: data.primary_id })
      x = mapped_party_data.firmName
    } else {
      x = "Company"
    }
    let u_data = {
      id: goods_return_voucher_data[i]._id,
      party_type: { id: party_type_data._id, name: party_type_data.party_type },
      party_id: { id: party_data._id, name: party_data.firmName },
      total_amount: goods_return_voucher_data[i].total_amount,
      net_amount: goods_return_voucher_data[i].net_amount,
      approved_amount: goods_return_voucher_data[i].approved_amount || 0,
      entry_type: "Voucher",
      date: goods_return_voucher_data[i].date,
      total_qty: goods_return_voucher_data[i].total_qty,
      received_by: x,
      depriciation: goods_return_voucher_data[i].depriciation,
      description: goods_return_voucher_data[i].description,
      photo: goods_return_voucher_data[i].photo,
      approval_status: goods_return_voucher_data[i].approval_status,
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Goods return Vouchers", result: list, count: count.length, pageLength: Math.ceil(count.length / limit) })
})

router.post('/goods_return_detailed_reports', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = 10;
  let list = []
  let arr = [{ company_id }]
  if (party_type_id != "") arr.push({ party_type_id })
  if (party_id != "") arr.push({ party_id })
  let goods_return_detailed_data = await DetailedGoodsReturn.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await DetailedGoodsReturn.find({ $and: arr })
  console.log(goods_return_detailed_data);
  if (goods_return_detailed_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < goods_return_detailed_data.length; i++) {
    let item_data = await DetailedGoodsReturnItem.find({ detailed_id: goods_return_detailed_data[i]._id })
    let list2 = []
    for (let j = 0; j < item_data.length; j++) {
      let product_data = await Product.findOne({ _id: item_data[j].product_id })
      let u_data2 = {
        product_name: product_data.productName,
        product_price: item_data[j].product_price,
        quantity: item_data[j].quantity,
        sub_total_price: item_data[j].sub_total_price
      }
      list2.push(u_data2)
    }
    let party_type_data = await PartyType.findOne({ _id: goods_return_detailed_data[i].party_type_id })
    let party_data = await Party.findOne({ _id: goods_return_detailed_data[i].party_id })
    let u_data = {
      party_type_id: { id: party_type_data._id, name: party_type_data.party_type },
      goods_return_date: goods_return_detailed_data[i].date,
      id: goods_return_detailed_data[i]._id,
      party_id: { id: party_data._id, name: party_data.firmName },
      total_amount: goods_return_detailed_data[i].total_amount,
      net_amount: goods_return_detailed_data[i].net_amount,
      deprication: goods_return_detailed_data[i].deprication,
      approval_status: goods_return_detailed_data[i].approval_status,
      item: list2
    }
    list.push(u_data)
  }
  return res.json({ status: true, message: "Detailed goods return reports", result: list, pageLength: Math.ceil(count.length / limit) })
})

router.post('/complete_performance_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let search = req.body.search ? req.body.search : "";
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let end_date = req.body.end_date ? req.body.end_date : "";
  let x = {}
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    x = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    x = { $gte: start_date, $lte: end_date }
  } else if (start_date != "" && end_date == "") {
    x = { $gte: start_date, $lte: date }
  }
  let condition = { companyId: company_id, is_delete: "0" }
  let pdf_employee_name = 'All Employee';
  let pdf_employee_state = 'All State';
  let pdf_employee_role = '';
  let pdf_employee_city = 'All City';
  let pdf_employee_id = '';
  let pdf_start_date = start_date;
  let pdf_end_date = end_date
  if (employee_id == "") {

    if (search != "") {
      var regex = new RegExp(search, 'i');
      condition.employeeName = regex;
    }
    let list = []
    let final_expense = 0;
    let final_salary = 0;
    let final_secondary_sale = 0;
    let final_primary_sale = 0;
    let pdf_total_party = 0
    let pdf_total_active_party = 0
    let pdf_total_primary_sales = 0
    let pdf_total_secondary_sales = 0
    let pdf_total_payment_collection = 0
    let pdf_out_standing = 0
    let pdf_total_expense = 0
    let pdf_salary = 0
    let pdf_total = 0
    let employee_data = await Employee.find(condition).limit(limit * 1).skip((page - 1) * limit);
    let count = await Employee.find(condition);
    if (employee_data.length < 1) return res.json({ status: true, message: "No employee found", result: [] })
    if (start_date == "" && end_date == "") {
      var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
      var days = Number(date.split("-")[2]);
    } else if (start_date != "" && end_date != "") {
      let y = new Date(end_date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (start_date != "" && end_date == "") {
      let y = new Date(date)
      let x = new Date(start_date)
      let diffTime = Math.abs(y - x);
      var days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    let w = 0;
    let z = 0;
    for (let a = 0; a < employee_data.length; a++) {
      let target = await EmployeeTarget.findOne({ employee_id: employee_data[a]._id });
      if (target) {
        // console.log(days);
        // console.log('total_secondary----',target.total_secondary);
        // console.log('total_primary------',target.total_primary);
        w += (Number(target.total_secondary ? target.total_secondary : 0))
        z += (Number(target.total_primary ? target.total_primary : 0))
      }
      final_salary += employee_data[a].userExpenses ? Number(employee_data[a].userExpenses.gross_salary) : 0
      let party_data = await Party.find({ employee_id: employee_data[a]._id, is_delete: "0" })
      let active_party_data = await Party.find({ employee_id: employee_data[a]._id, is_delete: "0", status: "Active" })
      let total_party = party_data.length;
      pdf_total_party += party_data.length;
      let total_active_party = active_party_data.length;
      pdf_total_active_party += active_party_data.length;
      let primary_order_data = await PrimaryOrder.find({ emp_id: employee_data[a]._id, is_delete: "0", date: x })
      var total_primary_sales = primary_order_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
      final_primary_sale += total_primary_sales;
      pdf_total_primary_sales += total_primary_sales;
      let secondary_order_data = await Order.find({ emp_id: employee_data[a]._id, is_delete: "0", order_date: x })
      var total_secondary_sales = secondary_order_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
      final_secondary_sale += total_secondary_sales;
      pdf_total_secondary_sales += total_secondary_sales;
      let payment_collection_data = await PaymentCollection.find({ employee_id: employee_data[a]._id, is_delete: "0", date: x })
      let total_payment_collection = payment_collection_data.reduce((sum, data) => sum + Number(data.amount), 0)
      pdf_total_payment_collection += Number(total_payment_collection)
      let expense_data = await ExpenseReport.find({ employee_id: employee_data[a]._id, is_delete: "0", for_what_date: x })
      let total_expense = expense_data.reduce((sum, data) => sum + Number(data.total_claim_amount), 0)
      final_expense += total_expense;
      pdf_total_expense += total_expense;
      let out_standing = Math.abs(total_primary_sales + total_secondary_sales - total_payment_collection)
      pdf_out_standing += Number(out_standing);
      let salary = Number(employee_data[a].userExpenses ? employee_data[a].userExpenses.gross_salary : 0);
      pdf_salary += Number(salary)
      let total = salary + total_expense
      pdf_total += Number(total)
      let data = {
        emp_id: employee_data[a]._id,
        emp_name: employee_data[a].employeeName,
        total_party: total_party,
        total_active_party: total_active_party,
        total_primary_sales: total_primary_sales,
        total_secondary_sales: total_secondary_sales,
        total_payment_collection: total_payment_collection,
        out_standing: out_standing,
        total_expense: total_expense,
        salary: salary,
        total: total,
      }
      list.push(data)
    }
    console.log('w----', w);
    console.log('z------', z);
    console.log('final_secondary_sale----', final_secondary_sale);
    console.log('final_primary_sale------', final_primary_sale);
    let secondary_performance = 0;
    let primary_performance = 0;
    if (w > 0 && z > 0) {
      secondary_performance = Math.ceil((final_secondary_sale / w) * 100)
      primary_performance = Math.ceil((final_primary_sale / z) * 100)
    }
    console.log(secondary_performance);
    console.log(primary_performance);
    let summary = {
      final_expense: final_expense,
      final_salary: final_salary,
      final_secondary_sale: final_secondary_sale,
      final_primary_sale: final_primary_sale,
      secondary_performance: `${secondary_performance}%`,
      primary_performance: `${primary_performance}%`,
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_id,
      pdf_start_date,
      pdf_end_date,
      pdf_total_party,
      pdf_total_active_party,
      pdf_total_primary_sales,
      pdf_total_secondary_sales,
      pdf_total_payment_collection,
      pdf_out_standing,
      pdf_total_expense,
      pdf_salary,
      pdf_total,
    }
    return res.json({
      status: true,
      message: "Data",
      result: list,
      summary,
      count: count.length,
      pageLength: Math.ceil(count.length / limit)
    })
  } else {
    let list = []
    let employee_data = await Employee.findOne({ _id: employee_id });
    let state_data = await Location.findOne({ id: employee_data.headquarterState })
    let city_data = await Location.findOne({ id: employee_data.headquarterCity })
    let role_data = await Role.findOne({ _id: employee_data.roleId })
    let pdf_employee_name = employee_data.employeeName;
    let pdf_employee_state = state_data.name;
    let pdf_employee_role = role_data?.roleName;
    let pdf_employee_city = city_data.name;
    let pdf_employee_unique_id = `${employee_data.company_code}${employee_data.employee_code}`;
    let mapped_party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" }).limit(limit * 1).skip((page - 1) * limit)
    let count = await Mapping.countDocuments({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
    let final_salary = employee_data.userExpenses ? Number(employee_data.userExpenses.gross_salary) : 0;
    let final_distributors = 0;
    let final_active_distributors = 0
    let final_secondary_sale = 0;
    let pdf_secondary_sale = 0;
    let final_primary_sale = 0;
    let pdf_primary_sale = 0;
    let final_primary_order = 0;
    let pdf_primary_order = 0;
    let final_expense = 0;
    let pdf_expense = 0;
    let final_visits = 0;
    let pdf_visits = 0;
    let final_total = 0;
    for (let i = 0; i < mapped_party_data.length; i++) {
      let party_data = await Party.findOne({ _id: mapped_party_data[i].assigned_to_id, is_delete: "0" })
      if (party_data.status == "Active") {
        final_active_distributors++;
      } else {
        final_distributors++;
      }
      console.log("------------------------->", { party_id: party_data._id, emp_id: employee_id, visit_date: x })
      let visit_data = await Visit.find({ party_id: party_data._id, emp_id: employee_id, visit_date: x })
      final_visits += visit_data.length;
      pdf_visits += visit_data.length;
      let primary_sale_data = await PrimaryOrder.find({ delivery_status: "Delivered", emp_id: employee_data._id, party_id: party_data._id, is_delete: "0", date: x })
      let total_primary_sales = primary_sale_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
      final_primary_sale += total_primary_sales;
      pdf_primary_sale += total_primary_sales;
      let primary_order_data = await PrimaryOrder.find({ emp_id: employee_data._id, party_id: party_data._id, is_delete: "0", date: x })
      let total_primary_order = primary_order_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
      final_primary_order += total_primary_order;
      pdf_primary_order += total_primary_order;
      let secondary_order_data = await Order.find({ delivery_status: "Delivered", emp_id: employee_data._id, is_delete: "0", order_date: x })
      let total_secondary_sales = secondary_order_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
      final_secondary_sale += total_secondary_sales;
      pdf_secondary_sale += total_secondary_sales;
      let expense_data = await ExpenseReport.find({ approval_status: "Approved", employee_id: employee_data._id, is_delete: "0", for_what_date: x })
      console.log(expense_data);
      let total_expense = expense_data.reduce((sum, data) => sum + Number(data.total_claim_amount), 0)
      final_expense += total_expense;
      pdf_expense += total_expense;
      let u_data = {
        party: party_data.firmName,
        visit: visit_data.length,
        secondary_sale: total_secondary_sales,
        primary_sale: total_primary_sales,
        primary_order: total_primary_order,
        Expense: total_expense,
        status: party_data.status
      }
      list.push(u_data)
    }
    final_total = final_expense + final_salary;
    let summary = {
      final_distributors: final_distributors,
      final_active_distributors: final_active_distributors,
      final_secondary_sale: final_secondary_sale,
      final_primary_sale: final_primary_sale,
      final_primary_order: final_primary_order,
      final_salary: final_salary,
      final_expense: final_expense,
      final_visits: final_visits,
      final_total: final_total,
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_unique_id,
      pdf_start_date,
      pdf_end_date,
      pdf_secondary_sale,
      pdf_primary_sale,
      pdf_primary_order,
      pdf_expense,
      pdf_visits,
    }
    return res.json({ status: true, message: "Data", result: list, summary, count: count, pageLength: Math.ceil(count / limit) })
  }
})

router.post('/company_performance_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let summary_partytype = req.body.summary_partytype ? req.body.summary_partytype : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let arr = [{ company_id }]
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let condition = {}
  // let current_regexDate = `${year}-${month}-?[0-9]*`
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let pdf_party_type_name = 'All Party Types'
  if (start_date != "" && end_date != "") condition.date = { $gte: start_date, $lte: end_date }
  if (party_type_id != "") {
    let party_type = await PartyType.findOne({ _id: party_type_id });
    pdf_party_type_name = party_type.party_type
    arr.push({ partyType: party_type_id })
  }
  arr.push({ status: "Active" })
  let party_data = await Party.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let total_party_data = await Party.find({ $and: arr })
  var distributor_total_party = 0
  var distributor_total_active_party = 0
  var distributor_total_sale = 0
  var distributor_total_stock = 0
  var distributor_total_collection = 0
  var distributor_total_out_standing = 0
  var summary_total_party = 0
  var summary_total_active_party = 0
  var summary_total_sale = 0
  var summary_total_stock = 0
  var summary_total_collection = 0
  var summary_total_out_standing = 0
  var pdf_total_party = 0
  var pdf_total_active_party = 0
  var pdf_total_sale = 0
  var pdf_total_stock = 0
  var pdf_total_collection = 0
  var pdf_total_out_standing = 0
  for (let a = 0; a < total_party_data.length; a++) {
    condition.party_id = total_party_data[a]._id;
    condition.is_delete = "0";
    pdf_total_party++
    var primary_order_data = await Invoice.find(condition)
    if (primary_order_data.length > 0) {
      pdf_total_active_party++
    }
    pdf_total_sale += primary_order_data.reduce((sum, data) => sum + Number((data ? (data.invoice_amount ? data.invoice_amount : 0) : 0)), 0)
    var stock_data = await Stock.find(condition)
    pdf_total_stock += stock_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
    var payment_collection_data = await PaymentCollection.find(condition)
    pdf_total_collection += payment_collection_data.reduce((sum, data) => sum + Number(data.amount), 0)
    pdf_total_out_standing += Math.abs(pdf_total_sale - pdf_total_collection)
  }
  condition = {}
  for (let a = 0; a < total_party_data.length; a++) {
    if (summary_partytype != "") {
      if (summary_partytype == total_party_data[a].partyType) {// selected party type summary data
        condition.party_id = total_party_data[a]._id;
        condition.is_delete = "0";
        summary_total_party++
        distributor_total_party++
        var primary_order_data = await Invoice.find(condition)
        if (primary_order_data.length > 0) {
          summary_total_active_party++
        }
        summary_total_sale += primary_order_data.reduce((sum, data) => sum + Number(data.invoice_amount), 0)
        var stock_data = await Stock.find(condition)
        summary_total_stock += stock_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
        var payment_collection_data = await PaymentCollection.find(condition)
        summary_total_collection += payment_collection_data.reduce((sum, data) => sum + Number(data.amount), 0)
        summary_total_out_standing += Math.abs(summary_total_sale - summary_total_collection)
      }

    }
    condition.party_id = total_party_data[a]._id;
    condition.is_delete = "0";
    distributor_total_party++
    var primary_order_data = await Invoice.find(condition)
    if (primary_order_data.length > 0) {
      distributor_total_active_party++
    }
    distributor_total_sale += primary_order_data.reduce((sum, data) => sum + Number((data ? (data.invoice_amount ? data.invoice_amount : 0) : 0)), 0)
    var stock_data = await Stock.find(condition)
    distributor_total_stock += stock_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
    var payment_collection_data = await PaymentCollection.find(condition)
    distributor_total_collection += payment_collection_data.reduce((sum, data) => sum + Number(data.amount), 0)
    distributor_total_out_standing += Math.abs(distributor_total_sale - distributor_total_collection)
  }
  condition = {}
  if (start_date != "" && end_date != "") condition.date = { $gte: start_date, $lte: end_date }
  for (let a = 0; a < party_data.length; a++) {
    condition.party_id = party_data[a]._id;
    condition.is_delete = "0";
    let party_type_data = await PartyType.findOne({ _id: party_data[a].partyType })
    let primary_order_invoice_data = await Invoice.find(condition)
    let sale = primary_order_invoice_data.reduce((sum, data) => {
      return sum += Number(((data ? (data.invoice_amount ? data.invoice_amount : 0) : 0)))
    }, 0);
    let stock_data = await Stock.find(condition)
    let stock = stock_data.reduce((sum, data) => sum + Number(data.total_amount), 0)
    let payment_collection_data = await PaymentCollection.find(condition)
    let collection = payment_collection_data.reduce((sum, data) => sum + Number(data.amount), 0)
    let out_standing = Math.abs(sale - collection)
    let data = {
      party: party_data[a].firmName,
      party_type: party_type_data.party_type,
      collection: collection,
      sale: sale,
      out_standing: out_standing,
      status: party_data[a].status,
      stock: stock
    }
    list.push(data)
  }
  return res.json({
    status: true, message: "Company performance report", result: {
      list: list,
      distributor_total_party: distributor_total_party,
      distributor_total_active_party: distributor_total_active_party,
      distributor_total_sale: distributor_total_sale,
      distributor_total_stock: distributor_total_stock,
      distributor_total_collection: distributor_total_collection,
      distributor_total_out_standing: distributor_total_out_standing,
      summary_total_party: summary_total_party,
      summary_total_active_party: summary_total_active_party,
      summary_total_sale: summary_total_sale,
      summary_total_stock: summary_total_stock,
      summary_total_collection: summary_total_collection,
      summary_total_out_standing: summary_total_out_standing,
      pdf_start_date,
      pdf_end_date,
      pdf_party_type_name,
      pdf_total_party,
      pdf_total_active_party,
      pdf_total_sale,
      pdf_total_stock,
      pdf_total_collection,
      pdf_total_out_standing,
    }, pageLength: Math.ceil(total_party_data.length / limit), count: total_party_data.length,
  })
})

router.post('/ss_wise_performance_report', async (req, res) => {
  let party_id = req.body.party_id ? req.body.party_id : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let list = []
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let condition = {}
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    condition.date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    condition.date = { $gte: start_date, $lte: end_date }
  }
  let party_da = await Party.findOne({ _id: party_id });
  let party_type_data = await PartyType.findOne({ _id: party_da.partyType });
  let state_data = await Location.findOne({ id: party_da.state })
  let pdf_party_name = party_da.firmName;
  let pdf_party_type_name = party_type_data.party_type;
  let pdf_state_name = state_data.name;
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let party_data = await Mapping.find({ primary_id: party_id, primary_type: "SS", assigned_to_type: "Distributor" }).limit(limit * 1).skip((page - 1) * limit)
  let total_dealers_data = await Mapping.find({ primary_id: party_id, primary_type: "SS", assigned_to_type: "Distributor" })
  let total_active_dealers = 0
  for (let j = 0; j < total_dealers_data.length; j++) {
    if (total_dealers_data[j].status == "Active") {
      total_active_dealers++
    }
  }
  let total_dealers = total_dealers_data.length;
  let total_sale = 0
  let total_collection = 0
  let total_outstanding = 0
  let total_stock = 0
  for (let b = 0; b < total_dealers_data.length; b++) {
    condition.party_id = total_dealers_data[b].assigned_to_id;
    condition.is_delete = "0";
    console.log("condition---------", condition);
    let primary_order_data = await PrimaryOrder.find(condition)
    let sale = primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let stock_data = await Stock.find(condition)
    let stock = stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let payment_collection_data = await PaymentCollection.find(condition)
    let collection = payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
    let out_standing = sale - collection;
    total_sale += sale
    total_collection += collection
    total_outstanding += out_standing
    total_stock += stock
  }
  condition = {}
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    condition.date = new RegExp(current_regexDate)
  } else if (start_date != "" && end_date != "") {
    condition.date = { $gte: start_date, $lte: end_date }
  }
  for (let a = 0; a < party_data.length; a++) {
    condition.party_id = party_data[a].assigned_to_id;
    condition.is_delete = "0";
    console.log(condition);
    let par = await Party.findOne({ _id: party_data[a].assigned_to_id })
    let primary_order_data = await PrimaryOrder.find(condition)
    let sale = primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let stock_data = await Stock.find(condition)
    let stock = stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let payment_collection_data = await PaymentCollection.find(condition)
    let collection = payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
    let out_standing = Math.abs(sale - collection)
    let data = {
      party: par.firmName,
      collection: collection,
      sale: sale,
      out_standing: out_standing,
      status: party_data[a].status,
      stock: stock
    }
    list.push(data)
  }
  return res.json({
    status: true,
    message: "Company performance report",
    result: {
      list: list, total_active_dealers: total_active_dealers,
      total_dealers: total_dealers,
      total_sale: total_sale,
      total_collection: total_collection,
      total_outstanding: total_outstanding,
      total_ss_stock: total_stock,
      total_distributor_stock: total_stock,
      pdf_party_name,
      pdf_party_type_name,
      pdf_state_name,
      pdf_start_date,
      pdf_end_date,
    },
    pageLength: Math.ceil(total_dealers_data.length / limit),
    total_records: total_dealers_data.length
  })
})

router.post('/view_invoice', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let order_id = req.body.order_id ? req.body.order_id : "";
  let invoice_data = await Invoice.findOne({ _id: order_id })
  if (!invoice_data) return res.json({ status: true, message: "No data", result: [] })
  let list = []
  let admin_data = await Admin.findOne({ _id: company_id })
  let party_data = await Party.findOne({ _id: invoice_data.party_id })
  let city_data = await Location.findOne({ id: party_data.city })
  let primary_order_data = await PrimaryOrder.findOne({ _id: invoice_data.order_id })
  for (let i = 0; i < invoice_data.product_list.length; i++) {
    let item_data = await PrimaryOrderItem.findOne({ order_id: primary_order_data._id, product_id: invoice_data.product_list[i].product_id })
    console.log("khf", item_data)
    let pro_data = await Product.findOne({ _id: invoice_data.product_list[i].product_id })
    let list_price = Number(item_data.sub_total_price)
    let discount = invoice_data.product_list[i].discount || 10
    let net_price = Number(list_price - (Number(list_price * discount) / 100))
    console.log("net price 1-------------> ", net_price)
    let gst = Number(invoice_data.product_list[i].gst);
    let taxable_amount = 0
    if (gst == 5) {
      taxable_amount = Math.abs(net_price / 1.05)
    } else if (gst == 12) {
      taxable_amount = Math.abs(net_price / 1.12)
    } else if (gst == 18) {
      taxable_amount = Math.abs(net_price / 1.18)
    } else if (gst == 28) {
      taxable_amount = Math.abs(net_price / 1.28)
    }
    let product_data = {
      product_name: invoice_data.product_list[i].product_name,
      product_hsn: pro_data.hsn_code,
      nug: invoice_data.product_list[i].nug,
      qty: invoice_data.product_list[i].quantity,
      unit: invoice_data.product_list[i].unit,
      mrp: pro_data.price,
      list_price: Number(invoice_data.product_list[i].price),
      discount: invoice_data.product_list[i].discount || 10,
      // net_price: Number(invoice_data.product_list[i].price) - invoice_data.product_list[i].discount,
      net_price: Number(invoice_data.product_list[i].price) - (Number(invoice_data.product_list[i].price) * invoice_data.product_list[i].discount / 100),
      taxable_amount: taxable_amount,
      gst: gst,
      amount: net_price,
    }
    list.push(product_data)
    console.log("net price 2-------------> ", net_price)
  }
  let u_data = {
    company_name: admin_data.company_name,
    company_address: admin_data.companyAddress,
    company_GST: admin_data.GSTNo,
    company_phone: admin_data.phone,
    company_signature: admin_data.signatureImage,
    company_bank_name: '',
    company_account_no: '',
    company_ifsc_code: '',
    company_bank_branch_name: '',
    company_logo: admin_data.profileImage,
    terms_and_conditions: ``,
    party_name: party_data.firmName,
    party_address: party_data.address1,
    party_gstin: party_data.GSTNo,
    party_city: city_data.name,
    party_phone: party_data.mobileNo,
    invoice_no: invoice_data.invoice_no,
    tax_type: invoice_data.tax_type,
    invoice_date: invoice_data.invoice_date,
    vehicle_no: invoice_data.vehicle_no,
    transporter_name: invoice_data.transporter_name,
    e_waybill_no: invoice_data.ewaybill_no,
    total_nugs: invoice_data.total_nug,
    product_list: list,
  }
  return res.json({ status: true, message: "Invoice data", result: u_data })
})

router.post('/retailer_feedback_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let beat_id = req.body.beat_id ? req.body.beat_id : "";
  let retailer_id = req.body.retailer_id ? req.body.retailer_id : "";
  let customer_id = req.body.customer_id ? req.body.customer_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let pdf_beat_name = "All Beats";
  let pdf_customer_name = "All Customers";
  let pdf_state_name = "All States";
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let arr = [{ company_id }]
  if (retailer_id != "") arr.push({ retailer_id })
  if (customer_id != "") {
    let customer_data = await Retailer.findOne({ _id: customer_id });
    pdf_customer_name = customer_data.firmName;
    arr.push({ customer_id })
  }
  if (beat_id != "") {
    let beat_data = await Beat.findOne({ _id: beat_id });
    pdf_beat_name = beat_data.beat_name
    arr.push({ beat_id })
  }
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ date: { $gte: start_date, $lte: date } })
  }
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let feedback_data = await Feedback.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await Feedback.find({ $and: arr })
  if (feedback_data.length < 1) return res.json({ status: true, message: "No Data", result: [] })
  return res.json({
    status: true,
    message: "Data",
    result: feedback_data,
    count: count.length,
    pageLength: Math.ceil(count.length / limit),
    pdf_beat_name,
    pdf_customer_name,
    pdf_state_name,
    pdf_start_date,
    pdf_end_date,
  })
})

router.post('/salary_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let state = req.body.state ? req.body.state : '';
  let search = req.body.search ? req.body.search : '';
  let month = req.body.month ? req.body.month : '';
  let year = req.body.year ? req.body.year : '';
  let condition = { companyId: company_id, is_delete: '0' };
  if (search != "") {
    var regex = new RegExp(search, 'i');
    condition.employeeName = regex
  }
  let pdf_employee_name = 'All Employee';
  let pdf_employee_state = 'All State';
  let pdf_employee_role = '';
  let pdf_employee_city = 'All City';
  let pdf_employee_id = '';
  let pdf_month = month;
  let pdf_year = year
  if (state != '') {
    let state_data = await Location.findOne({ id: state });
    pdf_employee_state = state_data.name;
    condition.headquarterState = state;
  }
  let current_regexDate;
  let date = get_current_date().split(" ")[0];
  let x = 0
  if (month == "" && year == '') {
    current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    x = Number(date.split("-")[2])
  } else if (month != '' && year != '') {
    current_regexDate = `${year}-${month}-?[0-9]`
    x = 30
  } else {
    return res.json({ status: false, message: "Please provide both moth and year" })
  }
  let emp_data = await Employee.find(condition).limit(limit * 1).skip((page - 1) * limit)
  let count = await Employee.find(condition)
  if (emp_data.length < 1) return res.json({ status: true, message: "No Data", result: [] })
  let list = []
  let pdf_working_days = 0;
  let pdf_leave = 0;
  let pdf_gross = 0;
  let pdf_abscent = 0;
  let pdf_lop_days = 0;
  let pdf_lop_deduction = 0;
  let pdf_holidays = 0;
  let pdf_company_working_days = 0;
  let pdf_weekly_off = 0;
  let pdf_net_salary = 0;
  let pdf_salary_deduction = 0;
  let pdf_net_payable = 0
  for (let i = 0; i < emp_data.length; i++) {
    let attendance_data = await Attendance.find({ emp_id: emp_data[i]._id, date2: new RegExp(current_regexDate) })
    let leave_data = await Leave.find({ emp_id: emp_data[i]._id, date1: new RegExp(current_regexDate) })
    let night_stay_data = await NightStay.find({ emp_id: emp_data[i]._id, date: new RegExp(current_regexDate) })
    let state_data = await Location.findOne({ id: emp_data[i].headquarterState })
    let gross = 0;
    let abscent;
    let deduction = 0;
    let lop_deduction = 0;
    let weekoff = 4;
    let holidays = 0;
    let company_working_days = 0;
    let lop_days = 0;
    abscent = 30 - (attendance_data?.length || 0) - weekoff - holidays
    company_working_days = 30 - weekoff - holidays
    lop_days = abscent + Number(leave_data?.length)
    deduction = Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.professional_tax ? emp_data[i].userExpenses.professional_tax : 0) : 0) + Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.tds ? emp_data[i].userExpenses.tds : 0) : 0) + Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.esi ? emp_data[i].userExpenses.esi : 0) : 0) + Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.pf ? emp_data[i].userExpenses.pf : 0) : 0)
    lop_deduction = Number(((Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.gross_salary ? emp_data[i].userExpenses.gross_salary : 0) : 0)) / company_working_days) * lop_days)
    if (leave_data.length > 0) {
      gross = Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.gross_salary ? emp_data[i].userExpenses.gross_salary : 0) : 0) - Number(((Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.gross_salary ? emp_data[i].userExpenses.gross_salary : 0) : 0)) / company_working_days) * leave_data.length)
    } else {
      gross = Number(emp_data[i].userExpenses ? (emp_data[i].userExpenses.gross_salary ? emp_data[i].userExpenses.gross_salary : 0) : 0)
    }
    console.log(gross);
    let working_days = attendance_data?.length || 0;
    let night_stay = night_stay_data?.length || 0;
    let leave = leave_data?.length || 0;
    let net_salary = (gross - deduction).toFixed(0);
    let net_payable = Math.trunc(gross - deduction - lop_deduction);
    pdf_working_days += working_days;
    pdf_leave += leave;
    pdf_gross += Number(gross.toFixed(0));
    pdf_abscent += abscent;
    pdf_lop_days += lop_days;
    pdf_lop_deduction += Number(lop_deduction.toFixed(0));
    pdf_holidays += holidays;
    pdf_company_working_days += company_working_days;
    pdf_weekly_off += weekoff;
    pdf_net_salary += Number(net_salary);
    pdf_salary_deduction += deduction;
    pdf_net_payable += net_payable;
    let u_data = {
      name: emp_data[i].employeeName,
      id: emp_data[i]._id,
      state: state_data?.name || '',
      working_days: working_days,
      abscent: abscent,
      company_working_days: company_working_days,
      week_off: 4,
      lop_days: lop_days,
      leave: leave,
      night_stay: night_stay,
      holidays: holidays,
      gross_salary: gross.toFixed(0),
      lop_deduction: Math.trunc(lop_deduction),
      deduction: deduction,
      net_salary: net_salary,
      net_payable: net_payable
    }
    list.push(u_data)
  }
  return res.json({
    status: true,
    message: "Data",
    result: list,
    count: count.length,
    pageLength: Math.ceil(count.length / limit),
    pdf_employee_name,
    pdf_employee_state,
    pdf_employee_role,
    pdf_employee_city,
    pdf_employee_id,
    pdf_month,
    pdf_year,
    pdf_working_days,
    pdf_leave,
    pdf_gross,
    pdf_abscent,
    pdf_lop_days,
    pdf_lop_deduction,
    pdf_holidays,
    pdf_company_working_days,
    pdf_weekly_off,
    pdf_net_salary,
    pdf_salary_deduction,
    pdf_net_payable,
  })
})

router.post('/view_salary_slip', async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let month = req.body.month ? req.body.month : "";
  let year = req.body.year ? req.body.year : "";
  let date = get_current_date().split(" ")[0];
  if (month == "" || year == "") return res.json({ status: fase, message: "Please give month and year both" })
  let current_regexDate = `${year}-${month}-?[0-9]`
  let emp_data = await Employee.findOne({ _id: employee_id });
  let role_data = await Role.findOne({ _id: emp_data.roleId });
  let attendance_data = await Attendance.find({ emp_id: emp_data._id, date2: new RegExp(current_regexDate) })
  let leave_data = await Leave.find({ emp_id: emp_data._id, date1: new RegExp(current_regexDate) })
  let gross = 0;
  let deduction = 0;
  deduction = Number(emp_data.userExpenses ? (emp_data.userExpenses.professional_tax ? emp_data.userExpenses.professional_tax : 0) : 0) + Number(emp_data.userExpenses ? (emp_data.userExpenses.tds ? emp_data.userExpenses.tds : 0) : 0) + Number(emp_data.userExpenses ? (emp_data.userExpenses.esi ? emp_data.userExpenses.esi : 0) : 0) + Number(emp_data.userExpenses ? (emp_data.userExpenses.pf ? emp_data.userExpenses.pf : 0) : 0)
  if (leave_data.length > 0) {
    gross = Number(emp_data.userExpenses ? (emp_data.userExpenses.gross_salary ? emp_data.userExpenses.gross_salary : 0) : 0) - Number(((Number(emp_data.userExpenses ? (emp_data.userExpenses.gross_salary ? emp_data.userExpenses.gross_salary : 0) : 0)) / x) * leave_data.length)
  } else {
    gross = Number(emp_data.userExpenses ? (emp_data.userExpenses.gross_salary ? emp_data.userExpenses.gross_salary : 0) : 0)
  }
  let u_data = {
    employee_name: emp_data.employeeName,
    employee_id: ``,
    pay_period: `${month}-${year}`,
    pay_date: date,
    designation: role_data?.rolename,
    pf_no: '',
    esi_no: '',
    account_number: '',
    bank_name: '',
    ifsc: '',
    net_salary: gross - deduction,
    paid_days: attendance_data.length,
    lop_days: 0,
    basic: Number(emp_data.userExpenses ? (emp_data.userExpenses.basic_salary ? emp_data.userExpenses.basic_salary : 0) : 0),
    house_rent: Number(emp_data.userExpenses ? (emp_data.userExpenses.hra_allowance ? emp_data.userExpenses.hra_allowance : 0) : 0),
    other_earning: Number(emp_data.userExpenses ? (emp_data.userExpenses.others ? emp_data.userExpenses.others : 0) : 0),
    gross: Number(emp_data.userExpenses ? (emp_data.userExpenses.gross_salary ? emp_data.userExpenses.gross_salary : 0) : 0),
    income_tax: Number(emp_data.userExpenses ? (emp_data.userExpenses.tds ? emp_data.userExpenses.tds : 0) : 0),
    pf: Number(emp_data.userExpenses ? (emp_data.userExpenses.pf ? emp_data.userExpenses.pf : 0) : 0),
    deduction: deduction,
    net_payable: gross - deduction,
  }
  return res.json({ status: true, message: "Data", result: u_data })
})

router.post('/todays_attendance_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let arr = {}
  let arr2 = { companyId: company_id, is_delete: "0" }
  let date1 = req.body.date1 ? req.body.date1 : "";
  let state = req.body.state ? req.body.state : "";
  if (state != "") arr2.headquarterState = state;
  let list = []
  let online = 0;
  let offline = 0;
  let leave = 0;
  let date = get_current_date().split(" ")[0];
  if (date1 != "") {
    arr.date2 = date1
  } else {
    arr.date2 = date
  }
  let online_emp = [];
  let offline_emp = [];
  let leave_emp = [];
  let emp_data = await Employee.find(arr2)
  for (let i = 0; i < emp_data.length; i++) {
    let attendance_data = await Attendance.findOne({ $and: [arr, { emp_id: emp_data[i]._id }] });
    let leave_data = await Leave.findOne({ emp_id: emp_data[i]._id, date1: date })
    let tracking_data = await Tracking.findOne({ emp_id: emp_data[i]._id, date: date })
    if (attendance_data) {
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
      let headquarterState_data = await Location.findOne({ id: emp_data[i].headquarterState })
      let u_data = {
        emp_name: emp_data[i].employeeName,
        state: headquarterState_data.name,
        beat_name: beat_data ? beat_data.beatName : "",
        purpose: attendance_data ? attendance_data.activity_id : "",
        location: attendance_data ? attendance_data.location : "",
        all_location: tracking_data ? tracking_data.location : [],
        time: attendance_data ? attendance_data.date : "",
        status: "Online"
      }
      online_emp.push(u_data)
      // list.push(u_data)
      online++
    } else if (leave_data) {
      let headquarterState_data = await Location.findOne({ id: emp_data[i].headquarterState })
      let u_data = {
        emp_name: emp_data[i].employeeName,
        state: headquarterState_data.name,
        beat_name: "NA",
        purpose: "NA",
        location: "NA",
        time: "NA",
        status: "Leave",
        leave_reason: leave_data.reason,
      }
      leave_emp.push(u_data)
      // list.push(u_data)
      leave++
    } else {
      let beat_data = await Beat.findOne({ employee_id: emp_data[i]._id })
      let headquarterState_data = await Location.findOne({ id: emp_data[i].headquarterState })
      if (beat_data) {
        let u_data = {
          emp_name: emp_data[i].employeeName,
          state: headquarterState_data.name,
          beat_name: beat_data ? beat_data.beatName : "",
          status: "Offline"
        }
        offline_emp.push(u_data)
      } else {
        let headquarterState_data = await Location.findOne({ id: emp_data[i].headquarterState })
        let u_data = {
          emp_name: emp_data[i].employeeName,
          state: headquarterState_data.name,
          beat_name: "NA",
          status: "Offline"
        }
        offline_emp.push(u_data)
      }
      offline++
    }
  }
  let x = [...online_emp, ...offline_emp, ...leave_emp]
  return res.json({ status: true, message: "Data", result: { count: emp_data.length, online: online, leave: leave, emp: x, offline: offline, online_emp: online_emp, leave_emp: leave_emp, offline_emp: offline_emp } })
})

router.post('/monthly_attendance_report', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let arr = {};
  let list = []
  let condition = { companyId: company_id, is_delete: "0" };
  if (employee_id != "") condition._id = employee_id
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let state = req.body.state ? req.body.state : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  if (state != "") condition.headquarterState = state;
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.date2 = new RegExp(current_regexDate)
    var days = Number(date.split("-")[2]);
  } else if (start_date != "" && end_date != "") {
    // var current_regexDate = `${year}-${month}-?[0-9]*`
    let y = new Date(end_date)
    let x = new Date(start_date)
    let diffTime = Math.abs(y - x);
    var days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    arr.date2 = { $gte: start_date, $lte: end_date }
  } else if (start_date != "" && end_date == "") {
    let y = new Date(date)
    let x = new Date(start_date)
    let diffTime = Math.abs(y - x);
    var days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    arr.date2 = { $gte: start_date, $lte: date }
  }
  console.log(arr);
  // if (month != "" && year != "") arr.date2 = new RegExp(current_regexDate)
  console.log(condition);
  let emp_data = await Employee.find(condition).limit(limit * 1).skip((page - 1) * limit);
  // console.log(emp_data);
  if (emp_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  let holidays = 0;
  let pdf_working_days_total = 0;
  let pdf_leave_total = 0;
  let pdf_holidays_total = 0;
  let pdf_absent_total = 0;
  let pdf_night_stay_total = 0;
  let pdf_employee_name = 'All Employee';
  let pdf_employee_state = 'All State';
  let pdf_employee_role = ' ';
  let pdf_employee_city = 'All City';
  let pdf_employee_id = ' ';
  let pdf_start_date = start_date;
  let pdf_end_date = end_date
  for (let i = 0; i < emp_data.length; i++) {
    let attendance_data = await Attendance.find({ $and: [{ ...arr, emp_id: emp_data[i]._id }] })
    let location_data = await Location.findOne({ id: emp_data[i].headquarterState })
    let leave_data = await Leave.findOne({ emp_id: emp_data[i]._id, date1: new RegExp(current_regexDate) })
    let abscent = Number(days - ((attendance_data ? attendance_data.length : 0) + (leave_data ? leave_data.length : 0) + holidays))
    pdf_working_days_total += Number(attendance_data ? attendance_data.length : 0);
    pdf_leave_total += Number(leave_data ? leave_data.length : 0);
    pdf_holidays_total += holidays;
    pdf_absent_total += Number(abscent);
    pdf_night_stay_total += Number(0);
    let u_data = {
      emp_name: emp_data[i].employeeName,
      emp_id: emp_data[i]._id,
      assigned_state: location_data.name,
      working_days: attendance_data ? attendance_data.length : 0,
      night_stay: "NA",
      abscent: abscent,
      leave: leave_data ? leave_data.length : 0,
      holidays: holidays,
      basic_salary: emp_data[i].userExpenses,
      calculated_salary: emp_data[i].userExpenses,
    }
    list.push(u_data)
  }
  return res.json({
    status: true,
    message: "Data",
    result: list,
    count: emp_data.length,
    pageLength: Math.ceil(emp_data.length / limit),
    pdf_working_days_total,
    pdf_leave_total,
    pdf_holidays_total,
    pdf_absent_total,
    pdf_night_stay_total,
    pdf_employee_name,
    pdf_employee_state,
    pdf_employee_role,
    pdf_employee_city,
    pdf_employee_id,
    pdf_start_date,
    pdf_end_date,
  })
})

router.post('/monthly_attendance_report_single_employee', async (req, res) => {
  let employee = req.body.employee ? req.body.employee : "";
  let limit = req.body.limit ? req.body.limit : 10;
  let page = req.body.page ? req.body.page : "1";
  let employee_data = await Employee.findOne({ _id: employee });
  let date = get_current_date().split(" ")[0];
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
  }
  let y = 0;
  let w = 0;
  let present = 0;
  let abscent = 0;
  let leave = 0;
  let holidays = 0;
  let state_data = await Location.findOne({ id: employee_data.headquarterState })
  let city_data = await Location.findOne({ id: employee_data.headquarterCity })
  let role_data = await Role.findOne({ _id: employee_data.roleId })
  let pdf_employee_name = employee_data.employeeName;
  let pdf_employee_state = state_data?.name || '';
  let pdf_employee_role = role_data?.roleName || '';
  let pdf_employee_city = city_data?.name || '';
  let pdf_employee_unique_id = `${employee_data.company_code}${employee_data.employee_code}`;
  let pdf_start_date = start_date;
  let pdf_end_date = end_date
  for (let i = 0; i <= diffDays; i++) {
    let attendance_data = await Attendance.findOne({ emp_id: employee, date2: start_date })
    let leave_data = await Leave.findOne({ emp_id: employee, date: start_date })
    if (attendance_data) {
      present++
      let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
      let check_in_data = await Check.findOne({ emp_id: employee, check_in_date: new Date(start_date) })
      let location_data = await Tracking.findOne({ emp_id: employee, date: start_date })
      if (!check_in_data) {
        let u_data = {
          beat: beat_data.beatName,
          check_in: "",
          check_out: ``,
          purpose: attendance_data.activity_id || "NA",
          date: start_date,
          attachment: attendance_data.selfie || "NA",
        }
        main.push(u_data)
      } else {
        let u_data = {
          beat: beat_data.beatName,
          check_in: check_in_data ? check_in_data.check_in_time : "",
          check_in_location: location_data ? location_data.location[0].name : '',
          check_out: check_in_data ? check_in_data.check_out_time : "",
          check_out: check_in_data ? check_in_data.location2 : "",
          purpose: attendance_data.activity_id || "NA",
          date: start_date,
          attachment: attendance_data.selfie || "NA",
        }
        main.push(u_data)
      }
    } else if (leave_data) {
      leave++
      let u_data = {
        beat: 'Leave',
        check_in: "-",
        check_out: "-",
        purpose: "-",
        date: start_date,
        attachment: "-",
      }
      main.push(u_data)
    } else {
      abscent++
      let u_data = {
        beat: 'Absent',
        check_in: "-",
        check_out: "-",
        purpose: "-",
        date: start_date,
        attachment: "-",
      }
      main.push(u_data)
    }
    var list2 = main.slice(((page * limit) - limit), (page * limit));
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
    working_days: present,
    weekOff: y,
    holidays: holidays,
    leave: leave,
    abscent: abscent,
  }
  let pageLength = Math.ceil(diffDays / limit) === 0 ? 1 : Math.ceil(diffDays / limit)
  return res.json({
    status: true,
    message: "Data",
    result: list2,
    summary,
    pageLength,
    count: diffDays + 1,
    pdf_employee_name,
    pdf_employee_state,
    pdf_employee_role,
    pdf_employee_city,
    pdf_employee_unique_id,
    pdf_start_date,
    pdf_end_date,
  })
})

// router.post('/generate_invoice',async (req,res)=>{
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if(!token){
//       return res.json({
//           status:false,
//           message:"Token must be provided"
//       })
//   }
//   let date = get_current_date().split(" ")[0]
//   var decodedToken = jwt.verify(token, "test");
//   var company_id = decodedToken.user_id;
//   let order_id = req.body.order_id?req.body.order_id:"";
//   if(order_id=="") return res.json({status:false,message:"Please give order_id"})
//   let primary_order_data = await PrimaryOrder.findOne({_id:order_id})
//   let emp_data = await Employee.findOne({_id:primary_order_data.emp_id})
//   let party_data = await Party.findOne({_id:primary_order_data.party_id})
//     let order_item_data = await PrimaryOrderItem.find({order_id:primary_order_data._id})
//     let arr = []
//     for(let i = 0;i<primary_order_item_data.length;i++){
//         let product_data = await Product.findOne({_id:primary_order_item_data[i].product_id})
//         let u_data = {
//             product_name:product_data.productName,
//             price:product_data.price,
//             quantity:primary_order_item_data[i].quantity,
//             sub_total:primary_order_item_data[i].sub_total_price
//         }
//         arr.push(u_data)
//     }
//     let party_type_data = await PartyType.findOne({_id:primary_order_data.party_type_id})
//     let new_invoice =await Invoice.create({
//         emp_id:emp_data._id,
//         order_id:order_id,
//         emp_name:emp_data.employeeName,
//         company_id:company_id,
//         party_id:primary_order_data.party_id,
//         party_type_id:primary_order_data.party_type_id,
//         amount:primary_order_data.total_amount,
//         pay_amount:primary_order_data.total_amount,
//         party_name:party_data.firmName,
//         phone:party_data.mobileNo,
//         email:party_data.email,
//         party_type_name:party_type_data.party_type,
//         date:date,
//         details:arr,
//         Created_date:get_current_date(),
//         Updated_date:get_current_date(),
//         status:"Active",
//     })
//     return res.json({status:true,message:"Invoice generated successfully",result:new_invoice})
// })

router.post('/employee_party_wise_report', async (req, res) => {
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  if (employee_id == "") return res.json({ status: false, message: "Please select employee" })
  // let page = req.body.page ? req.body.page : "1";
  // let limit = 10;
  let list = []
  let arr = [{ employee_id }]
  let month = req.body.month ? req.body.month : "";
  let year = req.body.year ? req.body.year : "";
  let condition = {}
  let current_regexDate = `${year}-${month}-?[0-9]*`
  if (month != "" && year != "") condition.date = new RegExp(current_regexDate)
  let mapped_party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
  // let total_dealers_data = await Party.find({$and:arr})
  for (let a = 0; a < mapped_party_data.length; a++) {
    let party_data = await Party.findOne({ _id: mapped_party_data[a].assigned_to_id })
    condition.party_id = party_data._id;
    condition.is_delete = "0";
    console.log(condition);
    let primary_order_data = await PrimaryOrder.find(condition)
    let sale = primary_order_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let stock_data = await Stock.find(condition)
    let stock = stock_data.reduce((sum, data) => sum + parseInt(data.total_amount), 0)
    let payment_collection_data = await PaymentCollection.find(condition)
    let collection = payment_collection_data.reduce((sum, data) => sum + parseInt(data.amount), 0)
    let out_standing = sale - collection
    let data = {
      party: party_data.firmName,
      collection: collection,
      sale: sale,
      out_standing: out_standing,
      status: party_data.status,
      stock: stock
    }
    list.push(data)
  }
  return res.json({ status: true, message: "Data", result: list })
})

router.post('/generate_invoice', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let admin_data = await Admin.findOne({ _id: company_id })
  let invoice_id = req.body.invoice_id ? req.body.invoice_id : "";
  if (invoice_id && invoice_id != "") {
    await Invoice.deleteOne({ _id: invoice_id })
  }
  let invoice_date = req.body.invoice_date ? req.body.invoice_date : "";
  let voucher_no = req.body.voucher_no ? req.body.voucher_no : "";
  let partyType = req.body.partyType ? req.body.partyType : "";
  let sale_type = req.body.sale_type ? req.body.sale_type : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let supply_by_id = req.body.supply_by_id ? req.body.supply_by_id : "";
  let order_id = req.body.order_id ? req.body.order_id : "";
  let ewaybill_no = req.body.ewaybill_no ? req.body.ewaybill_no : "";
  let total_nug = req.body.total_nug ? req.body.total_nug : "";
  let transporter_name = req.body.transporter_name ? req.body.transporter_name : "";
  // let party = req.body.party?req.body.party:"";
  let invoice_amount = req.body.invoice_amount ? req.body.invoice_amount : "";
  let tax_type = req.body.tax_type ? req.body.tax_type : "";
  let emp_name = req.body.emp_name ? req.body.emp_name : "";
  let description = req.body.description ? req.body.description : "";
  let vehicle_no = req.body.vehicle_no ? req.body.vehicle_no : "";
  let invoice_no = req.body.invoice_no ? req.body.invoice_no : "";
  let product_list = req.body.product_list ? req.body.product_list : null;
  let tax = req.body.tax ? req.body.tax : null;
  if (invoice_date == "") return res.json({ status: false, message: "Please give invoice_date" })
  if (order_id == "") return res.json({ status: false, message: "Please give order_id" })
  // if(voucher_no=="") return res.json({status:false,message:"Please give voucher_no"})
  // if (vehicle_no == "") return res.json({ status: false, message: "Please give vehicle_no" })
  // if(sale_type=="") return res.json({status:false,message:"Please give sale_type"})
  if (invoice_no == "") return res.json({ status: false, message: "Please give invoice_no" })
  if (party_id == "") return res.json({ status: false, message: "Please give party_id" })
  if (product_list == null) return res.json({ status: false, message: "Please give product_list" })
  if (tax == null) return res.json({ status: false, message: "Please give tax" })
  let party_data = await Party.findOne({ _id: party_id })
  let supply_by_data = await Party.findOne({ _id: supply_by_id })
  let party_type_data = await PartyType.findOne({ _id: partyType })
  let order_data = await PrimaryOrder.findOne({ _id: order_id })
  let new_invoice = await Invoice.create({
    emp_name: emp_name,
    company_id: company_id,
    party_id: party_id,
    invoice_amount: invoice_amount,
    order_id: order_id,
    party_name: party_data.firmName,
    sale_type: sale_type,
    tax_type: tax_type,
    phone: party_data.phone,
    email: party_data.email,
    address: party_data.address,
    voucher_no: voucher_no,
    vehicle_no: vehicle_no,
    invoice_no: invoice_no,
    product_list: product_list,
    ewaybill_no: ewaybill_no,
    total_nug: total_nug,
    transporter_name: transporter_name,
    tax: tax,
    order_date: order_data.date,
    order_amount: order_data.total_amount,
    partyType: partyType,
    partyTypeName: party_type_data.party_type,
    state: party_data.state,
    invoice_date: invoice_date,
    supply_by_id: supply_by_id,
    supply_by: supply_by_data ? `${supply_by_data.firmName} (SS)` : admin_data.company_name,
    // supply_by:order_data.supply_by,
    Created_date: get_current_date(),
    Updated_date: get_current_date(),
    status: "Active"
  })
  await PrimaryOrder.findOneAndUpdate({ _id: order_id }, { $set: { delivery_status: "Mark Delivered" } })
  return res.json({ status: true, message: "Successfully created", result: new_invoice })
})

// router.post('/view_primary_order', async (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     return res.json({
//       status: false,
//       message: "Token must be provided"
//     })
//   }
//   var decodedToken = jwt.verify(token, "test");
//   var company_id = decodedToken.user_id;
//   let order_id = req.body.order_id ? req.body.order_id : "";
//   if (order_id == "") return res.json({ status: false, message: "Please give order_id" })
//   let primary_order_data = await PrimaryOrder.findOne({ _id: order_id })
//   let emp_data = await Employee.findOne({ _id: primary_order_data.emp_id })
//   let party_data = await Party.findOne({ _id: primary_order_data.party_id })
//   let state_data = await Location.findOne({ id: party_data.state })
//   let city_data = await Location.findOne({ id: party_data.city })
//   let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data._id })
//   let arr = []
//   for (let i = 0; i < primary_order_item_data.length; i++) {
//     let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id }) 
//     let discount = primary_order_item_data[i].discount || 0;
//     let sub_total = Number(product_data.price) - (Number(product_data.price)*(discount/100))
//     let u_data = {
//       product_name: product_data.productName,
//       product_id: product_data._id,
//       unit: product_data.packing_details,
//       gst: product_data.gst,
//       price: product_data.price,
//       quantity: primary_order_item_data[i].quantity,
//       hsn_code: primary_order_item_data[i].hsn_code,
//       sub_total: sub_total,
//       discount: discount,
//       amount:Math.trunc(sub_total*Number(primary_order_item_data[i].quantity))
//     }
//     arr.push(u_data)
//   }
//   let total_amount = 0
//   for(let i = 0;i<arr.length;i++){
//     total_amount += Number(arr[i].amount)
//   }
//   let party_type_data = await PartyType.findOne({ _id: primary_order_data.party_type_id })
//   let data = {
//     emp_id: emp_data._id,
//     order_id: order_id,
//     emp_name: emp_data.employeeName,
//     company_id: company_id,
//     party_id: primary_order_data.party_id,
//     feed_by_id: primary_order_data.supply_by_id || '',
//     party_type_id: primary_order_data.party_type_id,
//     amount: total_amount,
//     state: state_data.name,
//     city: city_data.name,
//     pay_amount: primary_order_data.total_amount,
//     party_name: party_data.firmName,
//     phone: party_data.mobileNo,
//     email: party_data.email,
//     party_type_name: party_type_data.party_type,
//     date: primary_order_data.date,
//     details: arr,
//   }
//   return res.json({ status: true, message: "Data", result: data })
// })

router.post('/view_primary_order', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let order_id = req.body.order_id ? req.body.order_id : "";
  if (order_id == "") return res.json({ status: false, message: "Please give order_id" })
  let primary_order_data = await PrimaryOrder.findOne({ _id: order_id })
  let emp_data = await Employee.findOne({ _id: primary_order_data.emp_id })
  let party_data = await Party.findOne({ _id: primary_order_data.party_id })
  let state_data = await Location.findOne({ id: party_data.state })
  let city_data = await Location.findOne({ id: party_data.city })
  let primary_order_item_data = await PrimaryOrderItem.find({ order_id: primary_order_data._id })

  let arr = []
  for (let i = 0; i < primary_order_item_data.length; i++) {
    let product_data = await Product.findOne({ _id: primary_order_item_data[i].product_id })

    let price;
    let pricelist_data;
    var grp_data = await PartyGrouping.findOne({ party_id: party_data._id })
    if (grp_data) {
      let mapped_pricelist_data = await Mapping.findOne({ primary_type: "PriceList", assigned_to_id: grp_data.grp_id, assigned_to_type: "PartyGroup" });
      if (mapped_pricelist_data) {
        pricelist_data = await PriceList.findOne({ _id: mapped_pricelist_data.primary_id });
      } else {
        //state ke according price lana hoga
        let mapped_state_data = await Mapping.findOne({ company_id: emp_data.companyId, primary_type: "PriceList", assigned_to_id: emp_data.state, assigned_to_type: "State" });
        pricelist_data = await PriceList.findOne({ _id: mapped_state_data.primary_id });
      }
    } else {
      //state ke according price lana hoga
      console.log(emp_data.state)
      let mapped_state_data = await Mapping.findOne({ company_id: emp_data.companyId, primary_type: "PriceList", assigned_to_id: emp_data.state, assigned_to_type: "State" });
      if (mapped_state_data) {
        pricelist_data = await PriceList.findOne({ _id: mapped_state_data.primary_id });
      }
    }
    if (pricelist_data) {
      if (party_data) {
        for (let a = 0; a < pricelist_data.pricelist_details.length; a++) {
          if (product_data._id == pricelist_data.pricelist_details[a].id) {
            if (party_data.partyType == pricelist_data.pricelist_details[a].partyType1.id) {
              price = Number(pricelist_data.pricelist_details[a].partyType1.value)
            } else if (party_data.partyType == pricelist_data.pricelist_details[a].partyType2.id) {
              price = Number(pricelist_data.pricelist_details[a].partyType2.value)
            } else {
              price = Number(product_data.price)
            }
          }
        }
      } else {
        price = Number(product_data.price)
      }
    } else {
      price = Number(product_data.price)
    }

    let discount = primary_order_item_data[i].discount || 0;
    let sub_total = Number(price) - (Number(price) * (discount / 100))
    let u_data = {
      product_name: product_data.productName,
      product_id: product_data._id,
      unit: product_data.packing_details,
      gst: product_data.gst,
      price: price,
      quantity: primary_order_item_data[i].quantity,
      hsn_code: primary_order_item_data[i].hsn_code,
      sub_total: sub_total,
      discount: discount,
      amount: Math.trunc(sub_total * Number(primary_order_item_data[i].quantity))
    }
    arr.push(u_data)
  }

  let total_amount = 0
  for (let i = 0; i < arr.length; i++) {
    total_amount += Number(arr[i].amount)
  }
  let party_type_data = await PartyType.findOne({ _id: primary_order_data.party_type_id })
  let data = {
    emp_id: emp_data._id,
    order_id: order_id,
    emp_name: emp_data.employeeName,
    company_id: company_id,
    party_id: primary_order_data.party_id,
    feed_by_id: primary_order_data.supply_by_id || '',
    party_type_id: primary_order_data.party_type_id,
    amount: total_amount,
    state: state_data.name,
    city: city_data.name,
    pay_amount: primary_order_data.total_amount,
    party_name: party_data.firmName,
    phone: party_data.mobileNo,
    email: party_data.email,
    party_type_name: party_type_data.party_type,
    date: primary_order_data.date,
    details: arr,
  }
  return res.json({ status: true, message: "Data", result: data })
})

router.post('/mark_delivered', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let order_id = req.body.order_id ? req.body.order_id : "";
  let supply_by_id = req.body.supply_by_id ? req.body.supply_by_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let invoice_no = req.body.invoice_no ? req.body.invoice_no : "";
  let partyType = req.body.partyType ? req.body.partyType : "";
  let invoice_date = req.body.invoice_date ? req.body.invoice_date : "";
  let invoice_amount = req.body.invoice_amount ? req.body.invoice_amount : "";
  let supply_by_data = await Party.findOne({ _id: supply_by_id })
  let party_data = await Party.findOne({ _id: party_id })
  let party_type_data = await PartyType.findOne({ _id: partyType })
  if (order_id == "") return res.json({ status: false, message: "Please give the order_id" })
  let result = await PrimaryOrder.findOneAndUpdate({ _id: order_id }, { $set: { delivery_status: "Mark Delivered" } })
  let new_invoice = Invoice.create({
    company_id: company_id,
    party_id: party_id,
    invoice_amount: invoice_amount,
    order_id: order_id,
    party_name: party_data.firmName,
    invoice_no: invoice_no,
    order_date: result.date,
    order_amount: result.total_amount,
    partyType: partyType,
    partyTypeName: party_type_data.party_type,
    state: party_data.state,
    invoice_date: invoice_date,
    supply_by_id: supply_by_id,
    supply_by: supply_by_data ? supply_by_data.firmName : '',
    Created_date: get_current_date(),
    Updated_date: get_current_date(),
    status: "Active"
  })
  return res.json({ status: true, message: "Marked as Delivered" })
})

router.post('/account_ledger', async (req, res) => {
  console.log("account_ledger ---------------------------------------->", req.body)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token must be provided" })
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let count = 1;
  let date = get_current_date().split(" ")[0];
  let start_date = req.body.start_date ? req.body.start_date : "";
  let limit = req.body.limit ? Number(req.body.limit) : 10;
  let page = req.body.page ? req.body.page : "1";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  if (party_id == "") return res.json({ status: false, message: "Please provide the party id" })
  let party_data = await Party.findOne({ _id: party_id });
  let party_type_data = await PartyType.findOne({ _id: party_data.partyType });
  let state_data = await Location.findOne({ id: party_data.state })
  let pdf_party_name = party_data.firmName;
  let pdf_party_type_name = party_type_data.party_type;
  let pdf_state_name = state_data.name;
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let list = []
  let total_credit = 0;
  let total_debit = 0;
  let arr = [{ company_id }]
  if (start_date != "" && end_date != "") arr.push({ date: { $gte: start_date, $lte: end_date } })
  if (start_date != "" && end_date == "") arr.push({ date: { $gte: start_date } })
  if (start_date == "" && end_date != "") arr.push({ date: { $lte: end_date } })
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
  let past_credit = 0
  let past_debit = 0
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

  // let maxNum = Math.max(past_claim_data?.length, past_goods_return_voucher_data?.length, past_collection_data?.length, past_invoice_data?.length)
  // for (let i = 0; i < maxNum; i++) {
  //    total_past_claim_data += past_claim_data[i]?.approved_amount || 0;
  //    total_past_goods_return_voucher_data += past_goods_return_voucher_data[i]?.approved_amount || 0;
  //    total_past_collection_data += past_collection_data[i]?.approval_amount || 0;
  //    total_past_invoice_data += past_invoice_data[i]?.invoice_amount || 0;
  // }

  past_credit = total_past_collection_data + total_past_claim_data + total_past_goods_return_voucher_data
  let past_balance = total_past_invoice_data - past_credit
  // console.log("past_balance 1 --------------------------------------", past_balance)
  // if (past_credit == 0) {
  //   past_credit = '-'
  // }
  // if (past_invoice_data) {
  //   if (total_past_invoice_data == 0) {
  //     past_debit = "-"
  //   } else {
  //     past_debit = total_past_invoice_data
  //   }
  // } else {
  //   past_debit = '-'
  // }
  let u_data = {
    date: start_date,
    particular: "Opening Balance B/F",
    credit: '-',
    debit: '-',
    balance: past_balance,
  }
  list.push(u_data)
  for (let i = 0; i <= diffDays; i++) {
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
        count++
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Claim",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: past_balance - Number(trans.approved_amount),
        }
        past_balance = past_balance - Number(trans.approved_amount)
        list.push(u_data)
      } else if (trans.payment_mode) {
        // collection
        count++
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Collection",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: past_balance - Number(trans.approved_amount),
        }
        past_balance = past_balance - Number(trans.approved_amount)
        list.push(u_data)
      } else if (trans.tax) {
        // invoice
        count++
        total_debit += Number(trans.invoice_amount)
        let u_data = {
          date: start_date,
          particular: "Sale",
          credit: '-',
          debit: Number(trans.invoice_amount),
          balance: Number(past_balance) + Number(trans.invoice_amount),
        }
        past_balance = Number(past_balance) + Number(trans.invoice_amount)
        list.push(u_data)
      } else {
        // good return
        count++
        total_credit += Number(trans.approved_amount)
        let u_data = {
          date: start_date,
          particular: "Good Return",
          credit: Number(trans.approved_amount),
          debit: '-',
          balance: past_balance - Number(trans.approved_amount),
        }
        past_balance = past_balance - Number(trans.approved_amount)
        list.push(u_data)
      }
    })

    // let total_claim_amount = 0;
    // let total_goods_return_voucher_data = 0;
    // let total_collection_data = 0;
    // let total_invoice_data = 0;

    // if (claim_data?.length > 0) total_claim_amount = claim_data.reduce((total, data) => { return total += Number(data.claim_amount) }, 0)
    // if (goods_return_voucher_data?.length > 0) total_goods_return_voucher_data = goods_return_voucher_data.reduce((total, data) => { return total += Number(data.net_amount) }, 0)
    // if (collection_data?.length > 0) total_collection_data = collection_data.reduce((total, data) => { return total += Number(data.amount) }, 0)
    // if (invoice_data?.length > 0) total_invoice_data = invoice_data.reduce((total, data) => { return total += Number(data.invoice_amount) }, 0)

    // console.log("length", claim_data.length, goods_return_detailed_data.length, collection_data?.length, invoice_data.length)
    // let looplength;
    // console.log("start_date", start_date)
    // console.log("total_goods_return_voucher_data", total_goods_return_voucher_data)
    // console.log("total_collection_data", total_collection_data?.amount)
    // console.log("total_invoice_data", total_invoice_data)
    // credit = total_collection_data + total_claim_amount + total_goods_return_voucher_data
    // if (invoice_data) {
    //   if (credit > 0 && total_invoice_data > 0) {
    //     console.log('1----');
    //     count++
    //     total_credit += credit
    //     total_debit += total_invoice_data
    //     let u_data = {
    //       date: start_date,
    //       particular: "",
    //       credit: credit,
    //       debit: total_invoice_data,
    //       balance: Math.abs(Number(past_balance) - Number(credit) + Number(total_invoice_data)),
    //     }
    //     past_balance = Number(past_balance) - Number(credit) + Number(total_invoice_data)
    //     list.push(u_data)
    //   } else if (credit > 0 && total_invoice_data == 0) {
    //     console.log('2----');
    //     count++
    //     total_credit += credit
    //     let u_data = {
    //       date: start_date,
    //       particular: "Claim",
    //       credit: credit,
    //       debit: '-',
    //       balance: Math.abs(past_balance - credit),
    //     }
    //     past_balance = past_balance - credit
    //     list.push(u_data)
    //   } else if (credit == 0 && total_invoice_data > 0) {
    //     console.log('3----');
    //     count++
    //     total_debit += total_invoice_data
    //     let u_data = {
    //       date: start_date,
    //       particular: "Sale",
    //       credit: '-',
    //       debit: total_invoice_data,
    //       balance: Math.abs(Number(past_balance) + total_invoice_data),
    //     }
    //     past_balance = Number(past_balance) + total_invoice_data
    //     list.push(u_data)
    //   }
    // } else {
    //   if (credit > 0) {
    //     count++
    //     total_credit += credit
    //     let u_data = {
    //       date: start_date,
    //       particular: "Claim",
    //       credit: credit,
    //       debit: '-',
    //       balance: Math.abs(past_balance - credit),
    //     }
    //     past_balance = past_balance - credit
    //     list.push(u_data)
    //   }
    // }
    var list2 = list.slice(((page * limit) - limit), (page * limit));
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
  return res.json({
    status: true,
    message: "Data",
    result: {
      past_balance: Math.abs(past_balance),
      list: list2,
      total_credit: total_credit,
      total_debit: total_debit,
      pageLength: Math.ceil(count / limit),
      count: count,
      pdf_party_name,
      pdf_party_type_name,
      pdf_state_name,
      pdf_start_date,
      pdf_end_date,
    }
  })
})

router.post('/get_invoice', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let state = req.body.state ? req.body.state : "";
  let party = req.body.party ? req.body.party : "";
  let partyType = req.body.partyType ? req.body.partyType : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let page = req.body.page ? req.body.page : "1";
  let type = req.body.type ? req.body.type : "";
  let limit = req.body.limit ? req.body.limit : 10;
  let arr = []
  arr.push({ company_id })
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ invoice_date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ invoice_date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ invoice_date: { $gte: start_date, $lte: date } })
  }
  if (state != "") arr.push({ state })
  if (type != "") arr.push({ supply_by: type })
  if (party != "") arr.push({ party_id: party })
  if (partyType != "") arr.push({ partyType })
  let pdf_party_name = 'All Party';
  let pdf_party_state = "All State";
  let pdf_party_city = "All City";
  let pdf_party_type = "All party types";
  let pdf_start_date = start_date;
  let pdf_end_date = end_date;
  let total = 0
  if (party != "") {
    let party_data = await Party.findOne({ _id: party });
    if (party_data) {
      let state_data = await Location.findOne({ id: party_data.state })
      let city_data = await Location.findOne({ id: party_data.city });
      let partytype_data = await PartyType.findOne({ _id: party_data.partyType })
      pdf_party_name = party_data.firmName;
      pdf_party_state = state_data.name;
      pdf_party_city = city_data.name;
      pdf_party_type = partytype_data.party_type;
    }
  } else {
    if (state != "") {
      let state_data = await Location.findOne({ id: state });
      pdf_party_state = state_data.name;
    }
    if (partyType != "") {
      let partytype_data = await PartyType.findOne({ _id: partyType })
      pdf_party_type = partytype_data.party_type;
    }

  }
  let invoice_data = await Invoice.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit)
  let count = await Invoice.countDocuments({ $and: arr })
  if (invoice_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  for (let i = 0; i < invoice_data.length; i++) {
    total += Number(invoice_data[i].invoice_amount)
  }
  return res.json({
    status: true,
    message: "Invoices",
    count: count,
    pageLength: Math.ceil(count / limit),
    result: invoice_data,
    pdf_start_date,
    pdf_end_date,
    pdf_party_name,
    pdf_party_state,
    pdf_party_city,
    pdf_party_type,
    pdf_total_amount: total,
  })
})

router.post('/monthly_sales_target_plan', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let month = req.body.month ? req.body.month : "";
  let year = req.body.year ? req.body.year : "";
  if (employee_id == '') return res.json({ status: false, message: "Please select employee" })
  let emp_data = await Employee.findOne({ _id: employee_id });
  let state_data = await Location.findOne({ id: emp_data.headquarterState })
  let city_data = await Location.findOne({ id: emp_data.headquarterCity })
  let role_data = await Role.findOne({ _id: emp_data.roleId })
  let pdf_employee_name = emp_data.employeeName;
  let pdf_employee_state = state_data.name;
  let pdf_employee_role = role_data.roleName;
  let pdf_employee_city = city_data.name;
  let pdf_employee_unique_id = `${emp_data.company_code}${emp_data.employee_code}`;
  let pdf_month = month;
  let pdf_year = year
  if (month == '') return res.json({ status: false, message: "Please select month" })
  if (year == '') return res.json({ status: false, message: "Please select year" })
  if (!emp_data) return res.json({ status: false, message: "No employee found" })
  // let current_regex = `${year}-${month}-?[0-9]*`
  let party_list = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
  if (party_list.length < 1) return res.json({ status: true, message: "No party assigned", result: [] })
  let list = []
  let arr = [];
  for (let i = 0; i < party_list.length; i++) {
    arr.push(party_list[i].assigned_to_id)
  }
  let emp_target_data = await EmployeeTarget.findOne({ employee_id, month: month, year })
  let pdf_visits = 0
  let pdf_secondary = 0
  let pdf_primary = 0
  for (let i = 0; i < emp_target_data.target.length; i++) {
    let party_data = await Party.findOne({ _id: emp_target_data.target[i].id })
    pdf_visits += Number(emp_target_data ? (emp_target_data.target[i].number_of_visit ? emp_target_data.target[i].number_of_visit : 0) : 0,)
    pdf_secondary += Number(emp_target_data ? (emp_target_data.target[i].secondary_target ? emp_target_data.target[i].secondary_target : 0) : 0,)
    pdf_primary += Number(emp_target_data ? (emp_target_data.target[i].primary_target ? emp_target_data.target[i].primary_target : 0) : 0,)
    let u_data = {
      distributor_name: party_data.firmName,
      visit_plan: emp_target_data ? (emp_target_data.target[i].number_of_visit ? emp_target_data.target[i].number_of_visit : "NA") : "NA",
      secondary_sales_plan: emp_target_data ? (emp_target_data.target[i].secondary_target ? emp_target_data.target[i].secondary_target : "NA") : "NA",
      primary_order_plan: emp_target_data ? (emp_target_data.target[i].primary_target ? emp_target_data.target[i].primary_target : 'NA') : "NA",
    }
    list.push(u_data)
  }
  return res.json({
    status: true,
    message: "Data",
    result: list,
    pdf_employee_name,
    pdf_employee_state,
    pdf_employee_role,
    pdf_employee_city,
    pdf_employee_unique_id,
    pdf_month,
    pdf_year,
    pdf_visits,
    pdf_secondary,
    pdf_primary,
  })
})

router.post('/primary_sales_reports', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  // let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  // let party_id = req.body.party_id ? req.body.party_id : "";
  let employee_id = req.body.employee_id ? req.body.employee_id : "";
  let start_date = req.body.start_date ? req.body.start_date : "";
  let end_date = req.body.end_date ? req.body.end_date : "";
  let type = req.body.type ? req.body.type : "";
  let page = req.body.page ? req.body.page : "1";
  let limit = req.body.limit ? req.body.limit : 10;
  let arr = [{ company_id }, { delivery_status: new RegExp("Delivered") }]
  let list = []
  let date = get_current_date().split(" ")[0];
  if (start_date == "" && end_date == "") {
    var current_regexDate = `${date.split("-")[0]}-${date.split("-")[1]}-?[0-9]*`;
    arr.push({ date: new RegExp(current_regexDate) })
  } else if (start_date != "" && end_date != "") {
    arr.push({ date: { $gte: start_date, $lte: end_date } })
  } else if (start_date != "" && end_date == "") {
    arr.push({ date: { $gte: start_date, $lte: date } })
  }
  let pdf_employee_name = 'All Employee';
  let pdf_employee_state = 'All State';
  let pdf_employee_role = ' ';
  let pdf_employee_city = 'All City';
  let pdf_employee_unique_id = '';
  if (employee_id != "") {
    var emp_data = await Employee.findOne({ _id: employee_id });
    var state_data = await Location.findOne({ id: emp_data.headquarterState })
    var city_data = await Location.findOne({ id: emp_data.headquarterCity })
    var role_data = await Role.findOne({ _id: emp_data.roleId })
    arr.push({ emp_id: employee_id })
    pdf_employee_name = emp_data.employeeName;
    pdf_employee_state = state_data?.name || '';
    pdf_employee_role = role_data?.roleName || '';
    pdf_employee_city = city_data?.name || '';
    pdf_employee_unique_id = `${emp_data.company_code}${emp_data.employee_code}`;
  }
  let pdf_start_date = start_date;
  let pdf_end_date = end_date
  if (type != "") arr.push({ supply_by: type })
  console.log(arr);
  let primary_order_data = await PrimaryOrder.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  console.log(primary_order_data);
  let count = await PrimaryOrder.find({ $and: arr });
  let company_distributor_sale = 0;
  let ss_distributor_sale = 0;
  let company_ss_sale = 0;
  let total_sale = 0;
  for (let i = 0; i < primary_order_data.length; i++) {
    let employee_data = await Employee.findOne({ _id: primary_order_data[i].emp_id })
    let party_data = await Party.findOne({ _id: primary_order_data[i].party_id })
    let party_type_data = await PartyType.findOne({ _id: primary_order_data[i].party_type_id })
    if (party_type_data._id == "63766bb0043f582fcc7a80e5") {
      let mapped_party_data = await Mapping.findOne({ assigned_to_id: party_data._id, primary_type: "SS", assigned_to_type: "Distributor" })
      if (mapped_party_data) {
        ss_distributor_sale += Number(primary_order_data[i].total_amount)
        total_sale += Number(primary_order_data[i].total_amount)
        let party = await Party.findOne({ _id: mapped_party_data.primary_id })
        let u_data = {
          order_id: primary_order_data[i]._id,
          // emp:employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          delivery_status: primary_order_data[i].delivery_status,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          // approval_status:primary_order_data[i].approval_status,
          supply_by: party.firmName,
        }
        list.push(u_data)
      } else {
        company_distributor_sale += Number(primary_order_data[i].total_amount)
        total_sale += Number(primary_order_data[i].total_amount)
        let admin = await Admin.findOne({ _id: employee_data.companyId })
        let u_data = {
          order_id: primary_order_data[i]._id,
          // emp:employee_data.employeeName,
          party_type: party_type_data.party_type,
          order_date: primary_order_data[i].date,
          delivery_status: primary_order_data[i].delivery_status,
          party: party_data.firmName,
          total_amount: primary_order_data[i].total_amount,
          // approval_status:primary_order_data[i].approval_status,
          supply_by: admin.company_name,
        }
        list.push(u_data)
      }
    } else if (party_type_data._id == "63766b79043f582fcc7a80e1") {
      company_ss_sale += Number(primary_order_data[i].total_amount)
      total_sale += Number(primary_order_data[i].total_amount)
      let admin = await Admin.findOne({ _id: company_id })
      let u_data = {
        order_id: primary_order_data[i]._id,
        party_type: party_type_data.party_type,
        order_date: primary_order_data[i].date,
        party: party_data.firmName,
        total_amount: primary_order_data[i].total_amount,
        delivery_status: primary_order_data[i].delivery_status,
        supply_by: admin.company_name,
      }
      list.push(u_data)
    }
  }
  return res.json({
    status: true,
    message: "Primary sales",
    result: {
      list: list,
      company_distributor_sale: company_distributor_sale,
      ss_distributor_sale: ss_distributor_sale,
      company_ss_sale: company_ss_sale,
      pdf_employee_name,
      pdf_employee_state,
      pdf_employee_role,
      pdf_employee_city,
      pdf_employee_unique_id,
      pdf_start_date,
      pdf_end_date,
      total_sale: total_sale
    },
    count: count.length,
    pageLength: Math.ceil(count.length / limit),
  })
});

router.post('/beat_acc_to_state', async (req, res) => {
  let state = req.body.state ? req.body.state : "";
  if (state == "") return res.json({ status: false, message: "Please give state" });
  let state_data = await Location.findOne({ id: state });
  if (!state_data) return res.json({ status: false, message: "No such state" });
  let beat_list = await Beat.find({ state, is_delete: "0" }, { projection: { beatName: 1, _id: 1 } });
  if (beat_list.length < 1) return res.json({ status: false, message: "No data" });
  return res.json({ status: true, message: "Data", result: beat_list })
})

router.post('/edit_status_claim_report', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  let approved_amount = req.body.approved_amount ? req.body.approved_amount : "";
  if (id == "") return res.json({ status: false, message: "Please give id" })
  if (approved_amount == "") return res.json({ status: false, message: "Please give approved_amount" })
  let approval_status = req.body.approval_status ? req.body.approval_status : "";
  if (approval_status == "") return res.json({ status: false, message: "Please give approval_status" })
  let data = await Claim.findOneAndUpdate({ _id: id }, { $set: { approval_status, approved_amount } })
  return res.json({ status: true, message: "Updated successfully" })
})

router.post('/edit_status_payment_collection', async (req, res) => {
  console.log("edit_status_payment_collection", req.body)
  let id = req.body.id ? req.body.id : "";
  let approved_amount = req.body.approved_amount ? req.body.approved_amount : "";
  if (id == "") return res.json({ status: false, message: "Please give id" })
  if (approved_amount == "") return res.json({ status: false, message: "Please give approved_amount" })
  let approval_status = req.body.approval_status ? req.body.approval_status : "";
  if (approval_status == "") return res.json({ status: false, message: "Please give approval_status" })
  let data = await PaymentCollection.findOneAndUpdate({ _id: id }, { $set: { approval_status, approved_amount } }, { new: true })
  return res.json({ status: true, message: "Updated successfully" })
});

router.post('/edit_status_goodsreturn_voucher', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  let approved_amount = req.body.approved_amount ? req.body.approved_amount : "";
  if (id == "") return res.json({ status: false, message: "Please give id" })
  if (approved_amount == "") return res.json({ status: false, message: "Please give approved_amount" })
  let approval_status = req.body.approval_status ? req.body.approval_status : "";
  if (approval_status == "") return res.json({ status: false, message: "Please give approval_status" })
  let data = await VoucherGoodsReturn.findOneAndUpdate({ _id: id }, { $set: { approval_status, approved_amount } }, { new: true })
  return res.json({ status: true, message: "Updated successfully" })
})

router.delete('/delete_invoice', async (req, res) => {
  let invoice_id = req.body.invoice_id ? req.body.invoice_id : "";
  if (invoice_id == '') return res.json({ status: false, message: "Please send Invoice id" });
  let data = await Invoice.findOne({ _id: invoice_id });
  await PrimaryOrder.findByIdAndUpdate({ _id: data.order_id }, { $set: { approval_status: "Pending", delivery_status: "Pending" } });
  await Invoice.deleteOne({ _id: invoice_id })
  return res.json({ status: true, message: "Invoice deleted successfully" })
})

module.exports = router;