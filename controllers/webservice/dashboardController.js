const express = require("express");
const mongoose = require("mongoose");
const SalesReport = mongoose.model("SalesReport");
const Employee = mongoose.model("Employee");
const ExpenseReport = mongoose.model("ExpenseReport");
const Visit = mongoose.model("Visit");
const Order = mongoose.model("Order");
const Attendance = mongoose.model("Attendance");
const Retailer = mongoose.model("Retailer");
const Location = mongoose.model("Location");
const Beat = mongoose.model("Beat");
const Party = mongoose.model("Party");
const PrimaryOrder = mongoose.model("PrimaryOrder");
const PrimaryOrderItem = mongoose.model("PrimaryOrderItem");
const Mapping = mongoose.model("Mapping");
const ProductCatagory = mongoose.model("ProductCatagory");
const VoucherGoodsReturn = mongoose.model("VoucherGoodsReturn");
const Admin = mongoose.model("AdminInfo");
const EmployeeGrouping = mongoose.model("EmployeeGrouping");
const PaymentCollection = mongoose.model("PaymentCollection");
const Invoice = mongoose.model("Invoice");
const Check = mongoose.model("Check");
const OrderItem = mongoose.model("OrderItem");
const EmployeeTarget = mongoose.model("EmployeeTarget");
const Stock = mongoose.model("Stock");
const PartyType = mongoose.model("PartyType");
const Group = mongoose.model("Group");
const Product = mongoose.model("Product");
const Leave = mongoose.model("Leave");
const Tracking = mongoose.model("Tracking");
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

router.post('/employee_dashboard',async (req,res)=>{
    const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if(!token){
      return res.json({
          status:false,
          message:"Token must be provided"
      })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let admin_data = await Admin.findOne({_id:company_id})
  let type = req.body.type?req.body.type:"";
  let date = get_current_date().split(" ")[0]
    if (type == "today") {
        let emp_data = await Employee.find({ is_delete: "0", companyId: company_id });
        let active_user_15_min = 0;
        let active_user_1_hr = 0;
        let active_user_3_hr = 0;
        let new_retailers = 0;
        let tbc = 0;
        let total_beat = 0;
        let unattended_retailer = 0;
        let attended_retailer = 0;
        let online_emp = 0
        let offline_emp = 0
        let leave_emp = 0
        let tc = 0
        let pc = 0
        for (let i = 0; i < emp_data.length; i++) {
            let tracking_data =await Tracking.findOne({emp_id:emp_data[i]._id,date});
            if(tracking_data){
                let current_time = new Date().getTime() + 20060736 // 5hrs and 30 mins time is added 
                let s = tracking_data.location.length-1
                console.log('time ---------',((current_time-(new Date(tracking_data.location[s].date).getTime()))/(1000*60)));
                if(((current_time-(new Date(tracking_data.location[s].date).getTime()))/(1000*60)) <= 15){
                    active_user_15_min++;
                }else{
                    if(((current_time-(new Date(tracking_data.location[s].date).getTime()))/(1000*60*60)) <= 1){
                        active_user_1_hr++;
                    }else if(((current_time-(new Date(tracking_data.location[s].date).getTime()))/(1000*60*60)) <= 3){
                        active_user_3_hr++;
                    }
                }
            }
            let attendance_data = await Attendance.findOne({ date2: date, emp_id: emp_data[i]._id })
            let leave_data = await Leave.findOne({ date, emp_id: emp_data[i]._id })
            if (attendance_data) {
                total_beat++;
                online_emp++
                let completd_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: date, visit_status: "Completed" })
                let productive_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: date, visit_status: "Completed", order_status: "Productive" })
                if (completd_market_visit_data.length > 0 && productive_market_visit_data.length > 0) {
                    tc += completd_market_visit_data.length;
                    pc += productive_market_visit_data.length;
                }
                let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
                let route_arr = beat_data.route;
                for (let i = 0; i < route_arr.length; i++) {
                    let retailer_data = await Retailer.find({ route_id: route_arr[i] })
                    let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
                    tbc += retailer_data.length;
                    new_retailers += new_retailer_data.length;
                }
                let unattended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: date, visit_status: "Pending" })
                if (unattended_retailer_visit_data.length > 0) {
                    unattended_retailer += unattended_retailer_visit_data.length;
                }
                let attended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: date, visit_status: "Completed" })
                if (attended_retailer_visit_data.length > 0) {
                    attended_retailer += attended_retailer_visit_data.length;
                }
            } else if (leave_data) {
                leave_emp++
            } else {
                offline_emp++
            }
        }
        let u_data = {
            total_retailer_count: tbc,
            total_beat_count: total_beat,
            total_unattended_retailer: unattended_retailer,
            total_attended_retailer: attended_retailer,
            online_emp: online_emp,
            offline_emp: offline_emp,
            leave_emp: leave_emp,
            total_nc: new_retailers,
            total_tc: tc,
            total_pc: pc,
            total_user:emp_data.length,
            active_user_15_min:active_user_15_min,
            active_user_1_hr:active_user_1_hr,
            active_user_3_hr:active_user_3_hr,
        }
        return res.json({ status: true, message: "Data", result: u_data })
    } else if (type == "mtd") {
        let current_month = date.split("-")[1]
        let current_year = date.split("-")[0]
        if(current_month=="01"){
            var last_month = "12"
          }else{
            var last_month = parseInt(date.split("-")[1])
          }
          let last_year = date.split("-")[0]
          let last_regexDate = ``
          if(last_month<10){
            last_regexDate = `${last_year}-0${last_month-1}-?[0-9]*`
          }else if(last_month>9){
            last_regexDate = `${last_year}-${last_month}-?[0-9]*`
          }   
        let current_regexDate = `${current_year}-${current_month}-?[0-9]*`    
        let emp_data = await Employee.find({ is_delete: "0", companyId: company_id });
        let tbc = 0;
        let total_beat = 0;
        let unattended_retailer = 0;
        let attended_retailer = 0;
        let mtd_tc = 0;
        let mtd_pc = 0;
        let mtd_secondary_sales = 0;
        let mtd_primary_sales = 0;
        let lmtd_tc = 0;
        let lmtd_pc = 0;
        let lmtd_secondary_sales = 0;
        let lmtd_primary_sales = 0;
        let all_emp_rank_wise = [];
        let total_new_retailers = 0;
        let total_tc = 0;
        let total_pc = 0;
        let total_sales = 0;
        let emp_grp_monthly_sale = []
        let state_wise_sale = []
        let states = await Location.find({P_id:"",country_id:admin_data.country});
        for(let i = 0;i<states.length;i++){
            let states_emp = await Employee.find({headquarterState:states[i].id});
            let total_sale = 0;
            for(let j = 0;j<states_emp.length;j++){
                let sale = await Order.find({emp_id:states_emp[j]._id,order_date:current_regexDate});
                if(sale.length>0){
                    for(let k = 0;k<sale.length;k++){
                        total_sale += sale[k].total_amount;
                    }
                }
            }
            let data = {
                state_name:states[i].name,
                state_id:states[i].id,
                sale:total_sale
            }
            state_wise_sale.push(data)
        }
        let emp_grp_data = await Group.find({company_id})
        if(emp_grp_data.length>0){
            for(let j = 0;j<emp_grp_data.length;j++){
                let emp_grouping_data = await EmployeeGrouping.find({grp_id:emp_grp_data[j]._id})
                let sales = 0
                for(let k = 0;k<emp_grouping_data.length;k++){
                    let productive_market_visit_data = await Visit.find({ emp_id:emp_grouping_data[k].emp_id , visit_date: new RegExp(current_regexDate), visit_status: "Completed", order_status: "Productive" })
                    for(let j = 0;j<productive_market_visit_data.length;j++){
                        let order_data = await Order.findOne({retailer_id:productive_market_visit_data[j].retailer_id,order_date:productive_market_visit_data[j].visit_date})
                        sales += parseInt(order_data.total_amount)
                    }
                }
                let u_data = {
                    grp_name:emp_grp_data[j].grp_name,
                    grp_id:emp_grp_data[j]._id,
                    total_sale:sales,
                }
                emp_grp_monthly_sale.push(u_data)
            }
        }
        for (let i = 0; i < emp_data.length; i++) {
            let new_retailers = 0;
            let tc = 0;
            let pc = 0;
            let sales = 0;
            let assigned_beats = await Beat.find({ employee_id: emp_data[i]._id })
            if (assigned_beats.length > 0) {
                total_beat += assigned_beats.length;
            }
            let attendance_data = await Attendance.findOne({ date2: new RegExp(current_regexDate), emp_id: emp_data[i]._id })
                let completd_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed" })
                let productive_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed", order_status: "Productive" })
                if (completd_market_visit_data.length > 0 && productive_market_visit_data.length > 0) {
                    console.log("Inside if",i)
                    tc = completd_market_visit_data.length;
                    pc = productive_market_visit_data.length;
                    total_tc += completd_market_visit_data.length;
                    total_pc += productive_market_visit_data.length;
                    mtd_tc += completd_market_visit_data.length;
                    mtd_pc += productive_market_visit_data.length;
                    for(let j = 0;j<productive_market_visit_data.length;j++){
                        let order_data = await Order.findOne({retailer_id:productive_market_visit_data[j].retailer_id,order_date:productive_market_visit_data[j].visit_date})
                        sales += parseInt(order_data.total_amount)
                        total_sales += parseInt(order_data.total_amount)
                        mtd_secondary_sales += parseInt(order_data.total_amount)
                    }
                }else if(completd_market_visit_data.length > 0 && productive_market_visit_data.length < 1){
                    tc = completd_market_visit_data.length;
                }
                if(attendance_data){
                    let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
                    let route_arr = beat_data.route;
                    for (let i = 0; i < route_arr.length; i++) {
                        let retailer_data = await Retailer.find({ route_id: route_arr[i] })
                        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
                        tbc += retailer_data.length;
                        new_retailers += new_retailer_data.length;
                        total_new_retailers += new_retailer_data.length;
                    }
                }
                let unattended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Pending" })
                if (unattended_retailer_visit_data.length > 0) {
                    unattended_retailer += unattended_retailer_visit_data.length;
                }
                let attended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed" })
                if (attended_retailer_visit_data.length > 0) {
                    attended_retailer += attended_retailer_visit_data.length;
                }

                let emp_sales_rank_data = {
                    emp_name:emp_data[i].employeeName,
                    emp_id:emp_data[i]._id,
                    tc:tc,
                    pc:pc,
                    nc:new_retailers,
                    sales:sales,
                }
                all_emp_rank_wise.push(emp_sales_rank_data)
            let current_primary_sales_data = await PrimaryOrder.find({emp_id:emp_data[i]._id,date: new RegExp(current_regexDate)})
            let mtd_primary_sales = 0;
            for(let i = 0;i<current_primary_sales_data.length;i++){
                mtd_primary_sales += parseInt(current_primary_sales_data[i].total_amount)
            }
            let lmtd_completd_market_visit_data = await Visit.find({emp_id:emp_data[i]._id,visit_date:new RegExp(last_regexDate),visit_status:"Completed"})
            let lmtd_productive_market_visit_data = await Visit.find({emp_id:emp_data[i]._id,visit_date:new RegExp(last_regexDate),visit_status:"Completed",order_status:"Productive"})
            if(lmtd_completd_market_visit_data.length>0 && lmtd_productive_market_visit_data.length>0){
                lmtd_tc = lmtd_completd_market_visit_data.length;
                lmtd_pc = lmtd_productive_market_visit_data.length;
            }
            let last_secondary_sales_data = await Order.find({emp_id:emp_data[i]._id,order_date: new RegExp(last_regexDate)})
            for(let i = 0;i<last_secondary_sales_data.length;i++){
                lmtd_secondary_sales += parseInt(last_secondary_sales_data[i].total_amount)
            }
            let last_primary_sales_data = await PrimaryOrder.find({emp_id:emp_data[i]._id,date: new RegExp(last_regexDate)})
            for(let i = 0;i<last_primary_sales_data.length;i++){
                lmtd_primary_sales+=parseInt(last_primary_sales_data[i].total_amount)
            }
        }
        let catagory_data = await ProductCatagory.find({company_id}).limit(5*1);
        let catagory_wise_sec_sale = []
        for(let k = 0;k<catagory_data.length;k++){
            let catagory_sale_amount = 0;
            let order_data = await OrderItem.find({catagory_id:catagory_data[k]._id,date:new RegExp(current_regexDate)})
            console.log("order_data-----",order_data)
            for(let l = 0;l<order_data.length;l++){
                catagory_sale_amount += parseInt(order_data[l].sub_total_price)
            }
            let x = {
                catagory_name:catagory_data[k].name,
                catagory_sale_amount:catagory_sale_amount,
            }
            catagory_wise_sec_sale.push(x)
        }
        
        let u_data = {
            total_retailer_count: tbc,
            total_beat_count: total_beat,
            total_unattended_retailer: unattended_retailer,
            total_attended_retailer: attended_retailer,
            all_emp_rank_wise:all_emp_rank_wise,
            mtd_tc:mtd_tc,
            mtd_pc:mtd_pc,
            mtd_secondary_sales:mtd_secondary_sales,
            mtd_primary_sales:mtd_primary_sales,
            lmtd_tc:lmtd_tc,
            lmtd_pc:lmtd_pc,
            lmtd_secondary_sales:lmtd_secondary_sales,
            lmtd_primary_sales:lmtd_primary_sales,
            catagory_wise_sec_sale:catagory_wise_sec_sale,
            total_new_retailers:total_new_retailers,
            total_tc:total_tc,
            total_pc:total_pc,
            total_sales:total_sales,
            team_monthly_sale:emp_grp_monthly_sale,
            state_wise_sale:state_wise_sale,
        }
        return res.json({ status: true, message: "Data", result: u_data })
    } else if (type == "ytd") {
        let current_year = date.split("-")[0]   
        let current_regexDate = `${current_year}-?[0-9]*-?[0-9]*`    
        let emp_data = await Employee.find({ is_delete: "0", companyId: company_id });
        let tbc = 0;
        let total_beat = 0;
        let unattended_retailer = 0;
        let attended_retailer = 0;
        let all_emp_rank_wise = [];
        let total_new_retailers = 0;
        let total_tc = 0;
        let total_pc = 0;
        let total_sales = 0;
        let state_wise_sale = []
        let states = await Location.find({P_id:"",country_id:admin_data.country});
        for(let i = 0;i<states.length;i++){
            let states_emp = await Employee.find({headquarterState:states[i].id});
            let total_sale = 0;
            for(let j = 0;j<states_emp.length;j++){
                let sale = await Order.find({emp_id:states_emp[j]._id,order_date:current_regexDate});
                if(sale.length>0){
                    for(let k = 0;k<sale.length;k++){
                        total_sale += sale[k].total_amount;
                    }
                }
            }
            let data = {
                state_name:states[i].name,
                state_id:states[i].id,
                sale:total_sale
            }
            state_wise_sale.push(data)
        }
        let emp_grp_yearly_sale = []
        let emp_grp_data = await Group.find({company_id})
        if(emp_grp_data.length>0){
            for(let j = 0;j<emp_grp_data.length;j++){
                let emp_grouping_data = await EmployeeGrouping.find({grp_id:emp_grp_data[j]._id})
                let sales = 0
                for(let k = 0;k<emp_grouping_data.length;k++){
                    let productive_market_visit_data = await Visit.find({ emp_id:emp_grouping_data[k].emp_id , visit_date: new RegExp(current_regexDate), visit_status: "Completed", order_status: "Productive" })
                    for(let j = 0;j<productive_market_visit_data.length;j++){
                        let order_data = await Order.findOne({retailer_id:productive_market_visit_data[j].retailer_id,order_date:productive_market_visit_data[j].visit_date})
                        sales += parseInt(order_data.total_amount)
                    }
                }
                let u_data = {
                    grp_name:emp_grp_data[j].grp_name,
                    grp_id:emp_grp_data[j]._id,
                    total_sale:sales,
                }
                emp_grp_yearly_sale.push(u_data)
            }
        }
        for (let i = 0; i < emp_data.length; i++) {
            let new_retailers = 0;
            let tc = 0;
            let pc = 0;
            let sales = 0;
            let assigned_beats = await Beat.find({ employee_id: emp_data[i]._id })
            if (assigned_beats.length > 0) {
                total_beat += assigned_beats.length;
            }
            let attendance_data = await Attendance.findOne({ date2: new RegExp(current_regexDate), emp_id: emp_data[i]._id })
                let completd_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed" })
                let productive_market_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed", order_status: "Productive" })
                if (completd_market_visit_data.length > 0 && productive_market_visit_data.length > 0) {
                    console.log("Inside if",i)
                    tc = completd_market_visit_data.length;
                    pc = productive_market_visit_data.length;
                    total_tc += completd_market_visit_data.length;
                    total_pc += productive_market_visit_data.length;
                    for(let j = 0;j<productive_market_visit_data.length;j++){
                        let order_data = await Order.findOne({retailer_id:productive_market_visit_data[j].retailer_id,order_date:productive_market_visit_data[j].visit_date})
                        sales += parseInt(order_data.total_amount)
                        total_sales += parseInt(order_data.total_amount)
                    }
                }else if(completd_market_visit_data.length > 0 && productive_market_visit_data.length < 1){
                    tc = completd_market_visit_data.length;
                }
                if(attendance_data){
                    let beat_data = await Beat.findOne({ _id: attendance_data.beat_id })
                    let route_arr = beat_data.route;
                    for (let i = 0; i < route_arr.length; i++) {
                        let retailer_data = await Retailer.find({ route_id: route_arr[i] })
                        let new_retailer_data = await Retailer.find({ route_id: route_arr[i], date })
                        tbc += retailer_data.length;
                        new_retailers += new_retailer_data.length;
                        total_new_retailers += new_retailer_data.length;
                    }
                }
                let unattended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Pending" })
                if (unattended_retailer_visit_data.length > 0) {
                    unattended_retailer += unattended_retailer_visit_data.length;
                }
                let attended_retailer_visit_data = await Visit.find({ emp_id: emp_data[i]._id, visit_date: new RegExp(current_regexDate), visit_status: "Completed" })
                if (attended_retailer_visit_data.length > 0) {
                    attended_retailer += attended_retailer_visit_data.length;
                }

                let emp_sales_rank_data = {
                    emp_name:emp_data[i].employeeName,
                    emp_id:emp_data[i]._id,
                    tc:tc,
                    pc:pc,
                    nc:new_retailers,
                    sales:sales,
                }
                all_emp_rank_wise.push(emp_sales_rank_data)
        }
        let catagory_data = await ProductCatagory.find({company_id}).limit(5*1);
        let catagory_wise_sec_sale = []
        for(let k = 0;k<catagory_data.length;k++){
            let catagory_sale_amount = 0;
            let order_data = await OrderItem.find({catagory_id:catagory_data[k]._id,date:new RegExp(current_regexDate)})
            console.log("order_data-----",order_data)
            for(let l = 0;l<order_data.length;l++){
                catagory_sale_amount += parseInt(order_data[l].sub_total_price)
            }
            let x = {
                catagory_name:catagory_data[k].name,
                catagory_sale_amount:catagory_sale_amount,
            }
            catagory_wise_sec_sale.push(x)
        }
        let u_data = {
            total_retailer_count: tbc,
            total_beat_count: total_beat,
            total_unattended_retailer: unattended_retailer,
            total_attended_retailer: attended_retailer,
            all_emp_rank_wise:all_emp_rank_wise,
            catagory_wise_sec_sale:catagory_wise_sec_sale,
            total_new_retailers:total_new_retailers,
            total_tc:total_tc,
            total_pc:total_pc,
            total_sales:total_sales,
            team_yearly_sale:emp_grp_yearly_sale,
            state_wise_sale:state_wise_sale,
        }
        return res.json({ status: true, message: "Data", result: u_data })
    } else {
        return res.json({ status: false, message: "Please check the type" })
    }
});

router.post('/party_dashboard',async (req,res)=>{
    const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if(!token){
      return res.json({
          status:false,
          message:"Token must be provided"
      })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let admin_data = await Admin.findOne({_id:company_id})
  let type = req.body.type?req.body.type:"";
  let date = get_current_date().split(" ")[0]
  if(type == "mtd"){
    let total_ss_count = 0
    let active_ss_count = 0
    let ss_primary_sales = 0
    let ss_stock = 0
    let ss_collection = 0
    let ss_outstanding = 0
    let ss_goods_return = 0
    let total_sd_count = 0
    let active_sd_count = 0
    let sd_primary_sales = 0
    let sd_stock = 0
    let sd_collection = 0
    let sd_outstanding = 0
    let sd_goods_return = 0
    let total_cd_count = 0
    let active_cd_count = 0
    let cd_primary_sales = 0
    let cd_stock = 0
    let cd_collection = 0
    let cd_outstanding = 0
    let cd_goods_return = 0
    let total_sale = 0
    let total_outstanding = 0
    let total_collection = 0
    let mtd_order_amount = 0
    let mtd_completed_order_amount = 0
    let mtd_pending_order_amount = 0
    let mtd_orders_count = 0
    let mtd_completed_orders_count = 0
    let mtd_pending_orders_count = 0
    let lmtd_order_amount = 0
    let lmtd_completed_order_amount = 0
    let lmtd_pending_order_amount = 0
    let lmtd_orders_count = 0
    let lmtd_completed_orders_count = 0
    let lmtd_pending_orders_count = 0
    let month = date.split("-")[1]
    let year = date.split("-")[0]
    let current_regexDate = `${year}-${month}-?[0-9]*`
    let top_ten_distributor = []
    let top_ten_ss = []
    let x = 0;
    let y = 0;
    let top_ten_distributors_data = await Party.find({partyType:"63766bb0043f582fcc7a80e5",company_id:company_id,is_delete:"0"})
    for(let i = 0;i<top_ten_distributors_data.length;i++){
        let x_data = await PrimaryOrder.find({party_id:top_ten_distributors_data[i]._id,date:new RegExp(current_regexDate)})
        x += x_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let data ={
            distributor_name:top_ten_distributors_data[i].firmName,
            distributor_id:top_ten_distributors_data[i]._id,
            sale:x
        }
        top_ten_distributor.push(data)
    }
    top_ten_distributor.sort((a,b)=>{
        return parseInt(b.sale)-parseInt(a.sale);
    })
    let top_ten_ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",company_id,is_delete:"0"})
    for(let i = 0;i<top_ten_ss_data.length;i++){
        let y_data = await PrimaryOrder.find({party_id:top_ten_ss_data[i]._id,date:new RegExp(current_regexDate)})
        y += y_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let data ={
            distributor_name:top_ten_ss_data[i].firmName,
            distributor_id:top_ten_ss_data[i]._id,
            sale:y
        }
        top_ten_ss.push(data)
    }
    top_ten_ss.sort((a,b)=> parseInt(b.sale)-parseInt(a.sale))
    let all_state_data = await Location.find({P_id:"",country_id:admin_data.country});
    console.log(all_state_data.length)
    let state_wise_primary_sale = []
    if(all_state_data.length>0){
        for(let i = 0;i<all_state_data.length;i++){
            let state_primary_sales = 0;
            let state_collection = 0;
            let state_outstanding = 0;
            let party_data = await Party.find({state:all_state_data[i].id,company_id});
            if(party_data.length>0){
                for(let j = 0;j<party_data.length;j++){
                    let state_primary_order_data = await PrimaryOrder.find({party_id:party_data[j]._id,date:new RegExp(current_regexDate)})
                    state_primary_sales += state_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
                    let state_payment_collection_data = await PaymentCollection.find({party_id:party_data[j]._id,date:new RegExp(current_regexDate)})
                    state_collection += state_payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
                    state_outstanding += state_primary_sales-state_collection
                }
                let u_data = {
                    state_name:all_state_data[i].name,
                    state_id:all_state_data[i].id,
                    state_primary_sales:state_primary_sales,
                    state_collection:state_collection,
                    state_outstanding:state_outstanding,
                }
                state_wise_primary_sale.push(u_data)
            }else{
                let u_data = {
                    state_name:all_state_data[i].name,
                    state_id:all_state_data[i].id,
                    state_primary_sales:0,
                    state_collection:0,
                    state_outstanding:0,
                }
                state_wise_primary_sale.push(u_data)
            }
        }
    }
    let ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",company_id});
    let active_ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",status:"Active",company_id});
    total_ss_count = ss_data.length;
    active_ss_count = active_ss_data.length;
    if(ss_data.length>0){
        for(let i = 0;i<ss_data.length;i++){
            let primary_order_data = await PrimaryOrder.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            ss_outstanding += ss_primary_sales-ss_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }
    }
    let distributor_data = await Party.find({partyType:"63766bb0043f582fcc7a80e5",company_id});
    for(let i = 0;i<distributor_data.length;i++){
        let mapping_data = await Mapping.findOne({primary_type:"SS",assigned_to_type:"Distributor",assigned_to_id:distributor_data[i]._id})
        if(mapping_data){
            if(distributor_data[i].status == "Active"){
                active_sd_count++;
            }
            total_sd_count++;
            let primary_order_data = await PrimaryOrder.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            sd_outstanding += sd_primary_sales-sd_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }else{
            if(distributor_data[i].status == "Active"){
                active_cd_count++;
            }
            total_cd_count++;
            let primary_order_data = await PrimaryOrder.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            cd_outstanding += cd_primary_sales-cd_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }
    }
    let catagory_data = await ProductCatagory.find({company_id}).limit(5*1);
        let catagory_wise_sec_sale = []
        for(let k = 0;k<catagory_data.length;k++){
            let catagory_sale_amount = 0;
            let order_data = await OrderItem.find({catagory_id:catagory_data[k]._id,date:new RegExp(current_regexDate)})
            for(let l = 0;l<order_data.length;l++){
                catagory_sale_amount += parseInt(order_data[l].sub_total_price)
            }
            let x = {
                catagory_name:catagory_data[k].name,
                catagory_sale_amount:catagory_sale_amount,
            }
            catagory_wise_sec_sale.push(x)
        }
        total_sale = ss_primary_sales + sd_primary_sales + cd_primary_sales;
        total_outstanding = ss_outstanding + sd_outstanding + cd_outstanding;
        total_collection = ss_collection + sd_collection + cd_collection;
        let mtd_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate)})
        mtd_order_amount += mtd_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let mtd_pending_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate),delivery_status:"Pending"})
        mtd_pending_order_amount += mtd_pending_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let mtd_completed_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate),delivery_status:"Delivered"})
        mtd_completed_order_amount += mtd_completed_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        mtd_orders_count = mtd_primary_order_data.length;
        mtd_completed_orders_count = mtd_completed_primary_order_data.length;
        mtd_pending_orders_count = mtd_pending_primary_order_data.length;
        let current_month = date.split("-")[1]
        if(current_month=="01"){
            var last_month = "12"
          }else{
            var last_month = parseInt(date.split("-")[1])
          }
          let last_year = date.split("-")[0]
          let last_regexDate = ``
          if(last_month<10){
            last_regexDate = `${last_year}-0${last_month-1}-?[0-9]*`
          }else if(last_month>9){
            last_regexDate = `${last_year}-${last_month}-?[0-9]*`
          }
          let lmtd_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_regexDate)})
        lmtd_order_amount += lmtd_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let lmtd_pending_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_regexDate),delivery_status:"Pending"})
        lmtd_pending_order_amount += lmtd_pending_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let lmtd_completed_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_regexDate),delivery_status:"Delivered"})
        lmtd_completed_order_amount += lmtd_completed_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        lmtd_orders_count = lmtd_primary_order_data.length;
        lmtd_completed_orders_count = lmtd_completed_primary_order_data.length;
        lmtd_pending_orders_count = lmtd_pending_primary_order_data.length;
    let u_data = {
        total_ss_count:total_ss_count,
        active_ss_count:active_ss_count,
        ss_primary_sales:ss_primary_sales,
        ss_stock:ss_stock,
        ss_collection:ss_collection,
        ss_outstanding:ss_outstanding,
        ss_goods_return:ss_goods_return,
        total_sd_count:total_sd_count,
        active_sd_count:active_sd_count,
        sd_primary_sales:sd_primary_sales,
        sd_stock:sd_stock,
        sd_collection:sd_collection,
        sd_outstanding:sd_outstanding,
        sd_goods_return:sd_goods_return,
        total_cd_count:total_cd_count,
        active_cd_count:active_cd_count,
        cd_primary_sales:cd_primary_sales,
        cd_stock:cd_stock,
        cd_collection:cd_collection,
        cd_outstanding:cd_outstanding,
        cd_goods_return:cd_goods_return,
        catagory_wise_sec_sale:catagory_wise_sec_sale,
        total_sale:total_sale,
        total_outstanding:total_outstanding,
        total_collection:total_collection,
        mtd_order_amount:mtd_order_amount,
        mtd_completed_order_amount:mtd_completed_order_amount,
        mtd_pending_order_amount:mtd_pending_order_amount,
        mtd_orders_count:mtd_orders_count,
        mtd_completed_orders_count:mtd_completed_orders_count,
        mtd_pending_orders_count:mtd_pending_orders_count,
        lmtd_order_amount:lmtd_order_amount,
        lmtd_completed_order_amount:lmtd_completed_order_amount,
        lmtd_pending_order_amount:lmtd_pending_order_amount,
        lmtd_orders_count:lmtd_orders_count,
        lmtd_completed_orders_count:lmtd_completed_orders_count,
        lmtd_pending_orders_count:lmtd_pending_orders_count,
        state_wise_primary_sale:state_wise_primary_sale,
        top_ten_distributor:top_ten_distributor,
        top_ten_ss:top_ten_ss,
    }
    return res.json({status:true,message:"Data",result:u_data})
  }else if(type == "ytd"){
    let total_ss_count = 0
    let active_ss_count = 0
    let ss_primary_sales = 0
    let ss_stock = 0
    let ss_collection = 0
    let ss_outstanding = 0
    let ss_goods_return = 0
    let total_sd_count = 0
    let active_sd_count = 0
    let sd_primary_sales = 0
    let sd_stock = 0
    let sd_collection = 0
    let sd_outstanding = 0
    let sd_goods_return = 0
    let total_cd_count = 0
    let active_cd_count = 0
    let cd_primary_sales = 0
    let cd_stock = 0
    let cd_collection = 0
    let cd_outstanding = 0
    let cd_goods_return = 0
    let total_sale = 0
    let total_outstanding = 0
    let total_collection = 0
    let ytd_order_amount = 0
    let ytd_completed_order_amount = 0
    let ytd_pending_order_amount = 0
    let ytd_orders_count = 0
    let ytd_completed_orders_count = 0
    let ytd_pending_orders_count = 0
    let lytd_order_amount = 0
    let lytd_completed_order_amount = 0
    let lytd_pending_order_amount = 0
    let lytd_orders_count = 0
    let lytd_completed_orders_count = 0
    let lytd_pending_orders_count = 0
    let year = date.split("-")[0]
    let lastyear = parseInt(year)-1
    let current_regexDate = `${year}-?[0-9]*-?[0-9]*`
    let last_year_regexDate = `${lastyear}-?[0-9]*-?[0-9]*`
    let top_ten_distributor = []
    let top_ten_ss = []
    let x = 0;
    let y = 0;
    let top_ten_distributors_data = await Party.find({partyType:"63766bb0043f582fcc7a80e5",company_id:company_id,is_delete:"0"})
    for(let i = 0;i<top_ten_distributors_data.length;i++){
        let x_data = await PrimaryOrder.find({party_id:top_ten_distributors_data[i]._id,date:new RegExp(current_regexDate)})
        x += x_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let data ={
            distributor_name:top_ten_distributors_data[i].firmName,
            distributor_id:top_ten_distributors_data[i]._id,
            sale:x
        }
        top_ten_distributor.push(data)
    }
    top_ten_distributor.sort((a,b)=>{
        return parseInt(b.sale)-parseInt(a.sale);
    })
    let top_ten_ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",company_id,is_delete:"0"})
    for(let i = 0;i<top_ten_ss_data.length;i++){
        let y_data = await PrimaryOrder.find({party_id:top_ten_ss_data[i]._id,date:new RegExp(current_regexDate)})
        y += y_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let data ={
            distributor_name:top_ten_ss_data[i].firmName,
            distributor_id:top_ten_ss_data[i]._id,
            sale:y
        }
        top_ten_ss.push(data)
    }
    top_ten_ss.sort((a,b)=> parseInt(b.sale)-parseInt(a.sale))
    let all_state_data = await Location.find({P_id:"",country_id:admin_data.country});
    console.log(all_state_data.length)
    let state_wise_primary_sale = []
    if(all_state_data.length>0){
        for(let i = 0;i<all_state_data.length;i++){
            let state_primary_sales = 0;
            let state_collection = 0;
            let state_outstanding = 0;
            let party_data = await Party.find({state:all_state_data[i].id,company_id});
            if(party_data.length>0){
                for(let j = 0;j<party_data.length;j++){
                    let state_primary_order_data = await PrimaryOrder.find({party_id:party_data[j]._id,date:new RegExp(current_regexDate)})
                    state_primary_sales += state_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
                    let state_payment_collection_data = await PaymentCollection.find({party_id:party_data[j]._id,date:new RegExp(current_regexDate)})
                    state_collection += state_payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
                    state_outstanding += state_primary_sales-state_collection
                }
                let u_data = {
                    state_name:all_state_data[i].name,
                    state_id:all_state_data[i].id,
                    state_primary_sales:state_primary_sales,
                    state_collection:state_collection,
                    state_outstanding:state_outstanding,
                }
                state_wise_primary_sale.push(u_data)
            }else{
                let u_data = {
                    state_name:all_state_data[i].name,
                    state_id:all_state_data[i].id,
                    state_primary_sales:0,
                    state_collection:0,
                    state_outstanding:0,
                }
                state_wise_primary_sale.push(u_data)
            }
        }
    }
    let ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",company_id});
    let active_ss_data = await Party.find({partyType:"63766b79043f582fcc7a80e1",status:"Active",company_id});
    total_ss_count = ss_data.length;
    active_ss_count = active_ss_data.length;
    if(ss_data.length>0){
        for(let i = 0;i<ss_data.length;i++){
            let primary_order_data = await PrimaryOrder.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            ss_outstanding += ss_primary_sales-ss_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:ss_data[i]._id,date:new RegExp(current_regexDate)})
            ss_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }
    }
    let distributor_data = await Party.find({partyType:"63766bb0043f582fcc7a80e5",company_id});
    for(let i = 0;i<distributor_data.length;i++){
        let mapping_data = await Mapping.findOne({primary_type:"SS",assigned_to_type:"Distributor",assigned_to_id:distributor_data[i]._id})
        if(mapping_data){
            if(distributor_data[i].status == "Active"){
                active_sd_count++;
            }
            total_sd_count++;
            let primary_order_data = await PrimaryOrder.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            sd_outstanding += sd_primary_sales-sd_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            sd_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }else{
            if(distributor_data[i].status == "Active"){
                active_cd_count++;
            }
            total_cd_count++;
            let primary_order_data = await PrimaryOrder.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_primary_sales += primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let stock_data = await Stock.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_stock += stock_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
            let payment_collection_data = await PaymentCollection.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_collection += payment_collection_data.reduce((sum,data)=> sum + parseInt(data.amount),0)
            cd_outstanding += cd_primary_sales-cd_collection
            let goods_return_data = await VoucherGoodsReturn.find({party_id:distributor_data[i]._id,date:new RegExp(current_regexDate)})
            cd_goods_return += goods_return_data.reduce((sum,data)=> sum + parseInt(data.total_amount),0)
        }
    }
    let catagory_data = await ProductCatagory.find({company_id}).limit(5*1);
        let catagory_wise_sec_sale = []
        for(let k = 0;k<catagory_data.length;k++){
            let catagory_sale_amount = 0;
            let order_data = await OrderItem.find({catagory_id:catagory_data[k]._id,date:new RegExp(current_regexDate)})
            console.log("order_data-----",order_data)
            for(let l = 0;l<order_data.length;l++){
                catagory_sale_amount += parseInt(order_data[l].sub_total_price)
            }
            let x = {
                catagory_name:catagory_data[k].name,
                catagory_sale_amount:catagory_sale_amount,
            }
            catagory_wise_sec_sale.push(x)
        }
        total_sale = ss_primary_sales + sd_primary_sales + cd_primary_sales;
        total_outstanding = ss_outstanding + sd_outstanding + cd_outstanding;
        total_collection = ss_collection + sd_collection + cd_collection;
        let ytd_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate),company_id})
        ytd_order_amount += ytd_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let ytd_pending_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate),company_id,delivery_status:"Pending"})
        ytd_pending_order_amount += ytd_pending_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let ytd_completed_primary_order_data = await PrimaryOrder.find({date:new RegExp(current_regexDate),company_id,delivery_status:"Delivered"})
        ytd_completed_order_amount += ytd_completed_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        ytd_orders_count = ytd_primary_order_data.length;
        ytd_completed_orders_count = ytd_completed_primary_order_data.length;
        ytd_pending_orders_count = ytd_pending_primary_order_data.length;
        let current_month = date.split("-")[1]
        if(current_month=="01"){
            var last_month = "12"
          }else{
            var last_month = parseInt(date.split("-")[1])
          }
          let last_year = date.split("-")[0]
          let last_regexDate = ``
          if(last_month<10){
            last_regexDate = `${last_year}-0${last_month-1}-?[0-9]*`
          }else if(last_month>9){
            last_regexDate = `${last_year}-${last_month}-?[0-9]*`
          }
          let lytd_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_year_regexDate),company_id})
        lytd_order_amount += lytd_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let lytd_pending_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_year_regexDate),company_id,delivery_status:"Pending"})
        lytd_pending_order_amount += lytd_pending_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        let lytd_completed_primary_order_data = await PrimaryOrder.find({date:new RegExp(last_year_regexDate),company_id,delivery_status:"Delivered"})
        lytd_completed_order_amount += lytd_completed_primary_order_data.reduce((sum,data)=>sum + parseInt(data.total_amount),0)
        lytd_orders_count = lytd_primary_order_data.length;
        lytd_completed_orders_count = lytd_completed_primary_order_data.length;
        lytd_pending_orders_count = lytd_pending_primary_order_data.length;
    let u_data = {
        total_ss_count:total_ss_count,
        active_ss_count:active_ss_count,
        ss_primary_sales:ss_primary_sales,
        ss_stock:ss_stock,
        ss_collection:ss_collection,
        ss_outstanding:ss_outstanding,
        ss_goods_return:ss_goods_return,
        total_sd_count:total_sd_count,
        active_sd_count:active_sd_count,
        sd_primary_sales:sd_primary_sales,
        sd_stock:sd_stock,
        sd_collection:sd_collection,
        sd_outstanding:sd_outstanding,
        sd_goods_return:sd_goods_return,
        total_cd_count:total_cd_count,
        active_cd_count:active_cd_count,
        cd_primary_sales:cd_primary_sales,
        cd_stock:cd_stock,
        cd_collection:cd_collection,
        cd_outstanding:cd_outstanding,
        cd_goods_return:cd_goods_return,
        catagory_wise_sec_sale:catagory_wise_sec_sale,
        total_sale:total_sale,
        total_outstanding:total_outstanding,
        total_collection:total_collection,
        ytd_order_amount:ytd_order_amount,
        ytd_completed_order_amount:ytd_completed_order_amount,
        ytd_pending_order_amount:ytd_pending_order_amount,
        ytd_orders_count:ytd_orders_count,
        ytd_completed_orders_count:ytd_completed_orders_count,
        ytd_pending_orders_count:ytd_pending_orders_count,
        lytd_order_amount:lytd_order_amount,
        lytd_completed_order_amount:lytd_completed_order_amount,
        lytd_pending_order_amount:lytd_pending_order_amount,
        lytd_orders_count:lytd_orders_count,
        lytd_completed_orders_count:lytd_completed_orders_count,
        lytd_pending_orders_count:lytd_pending_orders_count,
        state_wise_primary_sale:state_wise_primary_sale,
        top_ten_distributor:top_ten_distributor,
        top_ten_ss:top_ten_ss,
    }
    return res.json({status:true,message:"Data",result:u_data})
  }else{
    return res.json({status:false,message:"Please check the type"})
  }
})

module.exports = router;