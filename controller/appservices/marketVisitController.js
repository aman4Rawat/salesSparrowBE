const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const Retailer = mongoose.model("Retailer");
const Visit = mongoose.model("Visit");
const Beat = mongoose.model("Beat");
const Order = mongoose.model("Order");
const Route = mongoose.model("Route");
const Attendance = mongoose.model("Attendance");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
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

// router.post('/party_acc_to_beat',async (req,res)=>{
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token)
//       return res.json({ status: false, message: "Token is required" });
//     let x = token.split(".");
//     if (x.length < 3)
//       return res.send({ status: false, message: "Invalid token" });
//     var decodedToken = jwt.verify(token, "test");
//     var employee_id = decodedToken.user_id;
//     let emp_data = await  Employee.findOne({_id:employee_id});
//     // console.log("emp_data",emp_data)
//     if(!emp_data) return res.json({status:false,message:"No employee data"});
//     let id = req.body.id?req.body.id:"";
//     if(id=="") return res.json({status:false,message:"Please give id"})
//     let beat_data =await Beat.findOne({_id:id});
//     // console.log("beat_data",beat_data)
//     if(!beat_data) return res.json({status:false,message:"No beat data. Please check id"});
//     let party_data = await Party.find({company_id:emp_data.companyId});
//     // console.log("party_data",party_data.length)
//     if(party_data.length<1) return res.json({status:true,message:"No data"});
//     let count = 0;
//     let list = [];
//     for(let i = 0;i<party_data.length;i++){
//         console.log(party_data[i])
//         console.log(party_data[i].route)
//         if(party_data[i].route==null){
//           count++
//           continue;

//         }else{
//           var arr = party_data[i].route[0]?party_data[i].route[0].split(","):"";
//           if(arr==""){
//             console.log("inside first if")
//             if(count==party_data.length-1 && list == []) return res.json({status:true,message:"No parties found",result:[]})
//             if(count==party_data.length-1 && list != []) return res.json({status:true,message:"parties found",result:list})
//           }else{
//             console.log("insidde else");
//             console.log(arr.length);
//             for(let j = 0;j<arr.length;j++){
//               console.log("inside for");
//               if(arr[j]==beat_data.route_id){
//                 console.log("insidde if");
//                 list.push(party_data[i])
//               }
//             }
//             console.log("list",list)
//           }
//         }
//         count++;
//         console.log("count",count)
//       }
//       if(count==party_data.length) return res.json({status:true,message:"parties found",result:list})
// });

router.post("/retailer_acc_to_beat", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  // console.log("emp_data",emp_data)
  if (!emp_data)
    return res.json({ status: false, message: "No employee data" });
  let id = req.body.id ? req.body.id : "";
  if (id == "") return res.json({ status: false, message: "Please give id" });
  // let beat_data = await Beat.findOne({ _id: id });
  // // console.log("beat_data",beat_data)
  // if (!beat_data)
  //   return res.json({
  //     status: false,
  //     message: "No beat data. Please check id",
  //   });
  let retailer_data = await Retailer.find({route_id: id,company_id: emp_data.companyId});
  // console.log("party_data",party_data.length)
  if (retailer_data.length < 1) return res.json({ status: true, message: "No data" ,result:[]});
  let list = []
  for (let j = 0; j < retailer_data.length; j++) {
    let total_num_of_orders =0;
    let total_order_sum =0;
    let average_order_value = 0
    let order_detail = await Order.findOne({retailer_id: retailer_data[j]._id,}).sort({ order_date: -1 });
    let all_order_details = await Order.find({retailer_id: retailer_data[j]._id,});
    if (order_detail) {
    total_num_of_orders = all_order_details.length;
    for(let a = 0;a<all_order_details.length;a++){
      total_order_sum += parseInt(all_order_details[a].total_amount);
    }
    average_order_value = Math.ceil(total_order_sum/total_num_of_orders)
      console.log("insidde if");
      list.push({
        retailer_data: retailer_data[j],
        last_visit: order_detail.order_date,
        total_order_amount: order_detail.total_amount,
        avg_amount:average_order_value,
      });
    } else {
      list.push({
        retailer_data: retailer_data[j],
        last_visit: "NA",
        total_order_amount: "NA",
        avg_amount:"NA",
      });
    }
  }
  return res.json({
    status: true,
    message: "Retailers found",
    result: list,
  });
  // let count = 0;
  // let list = [];
  // for(let i = 0;i<retailer_data.length;i++){
  //     console.log(retailer_data[i])
  //     console.log(retailer_data[i].route)
  //     if(retailer_data[i].route==null){
  //       count++
  //       continue;

  //     }else{
  //       var arr = retailer_data[i].route[0]?retailer_data[i].route[0].split(","):"";
  //       console.log("arr",arr)
  //       if(arr==""){
  //         console.log("inside first if")
  //         if(count==retailer_data.length-1 && list == []) return res.json({status:true,message:"No parties found",result:[]})
  //         if(count==retailer_data.length-1 && list != []) return res.json({status:true,message:"Retailers found",result:list})
  //       }else{
  //         console.log("insidde else");
  //         console.log(arr.length);
  //         for(let j = 0;j<arr.length;j++){
  //           console.log("inside for");
  //           if(arr[j]==beat_data.route_id){
  //             // let order_details = await Order.find({retailer_id:retailer_data[i]._id})
  //             let order_detail = await Order.findOne({retailer_id:retailer_data[i]._id}).sort({order_date:-1})
  //             if(order_detail){
  //               console.log("insidde if");
  //               list.push({retailer_data:retailer_data[i],last_visit:order_detail.order_date,total_order_amount:order_detail.total_amount})
  //             }else{
  //               list.push({retailer_data:retailer_data[i],last_visit:"NA",total_order_amount:"NA"})

  //             }
  //           }
  //         }
  //         console.log("list",list)
  //       }
  //     }
  //     count++;
  //     console.log("count",count)
  //   }
  // if(count==retailer_data.length) return res.json({status:true,message:"Retailers found",result:list})
});

router.get("/get_todays_beat", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0];
  let todays_attendance_data = await Attendance.findOne({emp_id: employee_id}).sort({Created_date:-1})
  if (!todays_attendance_data)
    return res.json({
      status: true,
      message: "Not punched attendance for today.",
    });
  let beat_data = await Beat.findOne({ _id: todays_attendance_data.beat_id });
  console.log(beat_data);
  if (!beat_data){ 
    return res.json({ status: true, message: "Beat data not found" });
  }else{
    let list2 = beat_data.route
    console.log(list2);
    let arr = [];
    for(let x = 0;x<list2.length;x++){
      var route_data = await Route.findOne({_id: list2[x]});
      let u_data = {
        id:route_data._id,
        route_name:route_data.route_name,
      }
      arr.push(u_data);
      console.log(arr);
    }
    return res.json({ status: true, message: "data found", result: beat_data,arr });
  }
});

router.post("/create_visit_summary", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let str = req.body.str ? req.body.str : "";
  let retailer_id = req.body.retailer_id ? req.body.retailer_id : "";
  let reason = req.body.reason ? req.body.reason : "";
  let beat_id = req.body.beat_id ? req.body.beat_id : "";
  if (retailer_id == "")
    return res.json({ status: false, message: "Please provide visit status" });
  if (str == "")
    return res.json({
      status: false,
      message: "Please provide retailer decision",
    });
  if (beat_id == "")
    return res.json({ status: false, message: "Please provide visit status" });
  let date = get_current_date().split(" ")[0];
  if (str == "visit_later") {
    let existing_visit_data = await Visit.findOneAndUpdate({
         beat_id: beat_id,
         retailer_id: retailer_id,
         visit_date: date,
         emp_id: employee_id,
         visit_status: "Pending",
      },{$set:{visit_status: "Progress",visit_time:new Date()}}, {new:true});
    // console.log(existing_visit_data);
    // if (existing_visit_data.length > 0)
    //   return res.json({
    //     status: true,
    //     message: "Already in progress",
    //     result: [],
    //   });
    // let visit_data = Visit.create({
    //   emp_id: employee_id,
    //   beat_id: beat_id,
    //   retailer_id: retailer_id,
    //   visit_status: "Progress",
    //   visit_date: date,
    //   Created_date: get_current_date(),
    //   Updated_date: get_current_date(),
    //   status: "Active",
    // });
    return res.json({status: true,message: "Pending Visit",result: existing_visit_data,});
  } else if (str == "no_order") {
    if(reason=="") return res.json({status:false,message:"Please give the reason"})
    let existing_visit_data = await Visit.findOne({$and: [{ beat_id: beat_id },{ retailer_id: retailer_id },{ visit_date: date },{ emp_id: employee_id }]});
    if(existing_visit_data.visit_status=="Pending"){
      var visit_data = await Visit.findOneAndUpdate({
        beat_id: beat_id,
        retailer_id: retailer_id ,
        visit_date: date ,
        emp_id: employee_id,
        visit_status: "Pending" 
      },{$set:{visit_status:"Completed" ,no_order_reason:reason,order_status:"Non-Productive",visit_time:new Date()}},{new:true});
    }else if(existing_visit_data.visit_status=="Progress"){
      var visit_data = await Visit.findOneAndUpdate({
        beat_id: beat_id,
        retailer_id: retailer_id ,
        visit_date: date ,
        emp_id: employee_id,
        visit_status: "Progress" 
      },{$set:{visit_status:"Completed" ,no_order_reason:reason,order_status:"Non-Productive",visit_time:new Date()}},{new:true});
    }
    // console.log(existing_visit_data2);
    // if (existing_visit_data2.length > 0) return res.json({status: true,message: "Already completed",result: [],});
    // let new_visit = new Visit({
    //   emp_id: employee_id,
    //   beat_id: beat_id,
    //   retailer_id: retailer_id,
    //   visit_status: "Completed",
    //   visit_date: date,
    //   no_order_reason: reason,
    //   order_status: "Non-Productive",
    //   Created_date: get_current_date(),
    //   Updated_date: get_current_date(),
    //   status: "Active",
    // });
    // let visit_data = await new_visit.save();
    return res.json({
      status: true,
      message: "Completed Visit",
      result: visit_data,
    });
  } else if (str == "order") {
    console.log("Inside order elseif")
    let existing_visit_data = await Visit.findOne({$and: [{ beat_id: beat_id },{ retailer_id: retailer_id },{ visit_date: date },{ emp_id: employee_id }]});
    console.log(existing_visit_data);
    if(existing_visit_data.visit_status=="Pending"){
      console.log("Inside pending if");
      var visit_data = await Visit.findOneAndUpdate({beat_id: beat_id , retailer_id: retailer_id , visit_date: date , emp_id: employee_id ,visit_status:"Pending"},{$set:{visit_status:"Completed",order_status: "Productive",no_order_reason:"",visit_time:new Date()}},{new:true});
      return res.json({
      status: true,
      message: "Completed Visit",
      result: visit_data,
    });
    }else if(existing_visit_data.visit_status=="Progress"){
      console.log("Inside progress else if");
      var visit_data = await Visit.findOneAndUpdate({beat_id: beat_id , retailer_id: retailer_id , visit_date: date , emp_id: employee_id ,visit_status:"Progress"},{$set:{visit_status:"Completed",order_status: "Productive",no_order_reason:"",visit_time:new Date()}},{new:true});
      return res.json({
      status: true,
      message: "Completed Visit",
      result: visit_data,
    });
    }
    // console.log(existing_visit_data3);
    // if (existing_visit_data3.length > 0)
    //   return res.json({
    //     status: true,
    //     message: "Already completed",
    //     result: [],
    //   });
    // let new_visit = new Visit({
    //   emp_id: employee_id,
    //   beat_id: beat_id,
    //   retailer_id: retailer_id,
    //   visit_status: "Completed",
    //   visit_date: date,
    //   order_status: "Productive",
    //   Created_date: get_current_date(),
    //   Updated_date: get_current_date(),
    //   status: "Active",
    // });
    // let visit_data = await new_visit.save();

  }
});

router.post("/retailer_acc_to_visit_status", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.json({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  visit_status = req.body.visit_status ? req.body.visit_status : "";
  let date = get_current_date().split(" ")[0];
  if (visit_status == "")
    return res.json({ status: false, message: "Please provide visit status" });
  let visit_details_data = await Visit.find({
  $and: [{ visit_date: date },{ emp_id: employee_id },{ visit_status: visit_status }]});
  console.log(visit_details_data);
  if (visit_details_data.length < 1)
    return res.json({ status: true, message: "No data", result: [] });
  let count = 0;
  let final_list = [];
  for (let j = 0; j < visit_details_data.length; j++) {
    if (visit_status == "Completed") {
      console.log("Hello 1");
      if (visit_details_data[j].order_status == "Productive") {
        let retailer_data = await Retailer.findOne({
          _id: visit_details_data[j].retailer_id,
        });
        let order_data = await Order.findOne({
          $and: [{ retailer_id: retailer_data._id }, { order_date: date }],
        });
        let u_data = {
          retailer_id:retailer_data._id,
          retailer_address:retailer_data.address,
          retailer_name: retailer_data.customerName,
          retailer_firmname: retailer_data.firmName,
          order_value: order_data.total_amount,
          order_status: visit_details_data[j].order_status,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
        };
        final_list.push(u_data);
        // count++;
        // if(count == visit_details_data.length) return res.json({status:true,message:"Data",result:list})
      } else if (visit_details_data[j].order_status == "Non-Productive") {
        console.log("Hello 1");
        let retailer_data = await Retailer.findOne({
          _id: visit_details_data[j].retailer_id,
        });
        let u_data = {
          retailer_id:retailer_data._id,
          retailer_address:retailer_data.address,
          retailer_firmname: retailer_data.firmName,
          retailer_name: retailer_data.customerName,
          reason: visit_details_data[j].no_order_reason,
          order_value: "NA",
          order_status: visit_details_data[j].order_status,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
        };
        final_list.push(u_data);
        // count++;
        // if(count == visit_details_data.length) return res.json({status:true,message:"Data",result:list})
      }
    } else if (visit_status == "Progress") {
      let retailer_data = await Retailer.findOne({
        _id: visit_details_data[j].retailer_id,
      });
      let visit_data = await Visit.findOne({
        $and: [
          { retailer_id: visit_details_data[j].retailer_id },
          { emp_id: employee_id },
        ],
      });
      let order_data = await Order.findOne({
        retailer_id: retailer_data._id,
      }).sort({ order_date: -1 });
      let total_num_of_orders =0;
      let total_order_sum =0;
      let average_order_value = 0
      let all_order_details = await Order.find({retailer_id: retailer_data._id,});
      total_num_of_orders = all_order_details.length;
      for(let a = 0;a<all_order_details.length;a++){
        total_order_sum += parseInt(all_order_details[a].total_amount);
      }
      average_order_value = Math.ceil(total_order_sum/total_num_of_orders)
      if(order_data){
        let u_data = {
          retailer_address:retailer_data.address,
          retailer_firmname: retailer_data.firmName,
          retailer_id:retailer_data._id,
          retailer_name: retailer_data.customerName,
          last_visit: visit_data.visit_date,
          order_value: order_data.total_amount,
          last_order_date: order_data.order_date,
          avg_amount:average_order_value,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
        };
        final_list.push(u_data);
      }else{
        let u_data = {
          retailer_id:retailer_data._id,
          retailer_name: retailer_data.customerName,
          retailer_firmname: retailer_data.firmName,
          retailer_address:retailer_data.address,
          avg_amount:average_order_value,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
          last_order_date: "NA",
          last_visit: "NA",
          order_value: "0",
        };
        final_list.push(u_data);
      }
      // count++;
      // if(count == visit_details_data.length) return res.json({status:true,message:"Data",result:list})
    }else if (visit_status == "Pending") {
      let total_num_of_orders =0;
      let total_order_sum =0;
      let average_order_value = 0
      let retailer_data = await Retailer.findOne({_id: visit_details_data[j].retailer_id,});
      let visit_data = await Visit.findOne({$and: [{ retailer_id: visit_details_data[j].retailer_id },{ emp_id: employee_id },{ visit_date: date }]});
      let order_data = await Order.findOne({retailer_id: retailer_data._id,}).sort({ order_date: -1 });
      let all_order_details = await Order.find({retailer_id: retailer_data._id,});
      total_num_of_orders = all_order_details.length;
      for(let a = 0;a<all_order_details.length;a++){
        total_order_sum += parseInt(all_order_details[a].total_amount);
      }
      average_order_value = Math.ceil(total_order_sum/total_num_of_orders)
      if(order_data){
        let u_data = {
          retailer_id:retailer_data._id,
          retailer_address:retailer_data.address,
          retailer_name: retailer_data.customerName,
          retailer_firmname: retailer_data.firmName,
          last_visit: visit_data.visit_date,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
          last_order_date:order_data.order_date,
          order_value: order_data.total_amount,
          avg_amount:average_order_value
        };
        final_list.push(u_data);
      }else{
        let u_data = {
          retailer_id:retailer_data._id,
          retailer_address:retailer_data.address,
          retailer_name: retailer_data.customerName,
          retailer_firmname: retailer_data.firmName,
          phone:retailer_data.mobileNo,
          lat:retailer_data.lat,
          long:retailer_data.long,
          last_visit: "NA",
          last_order_date:"NA",
          order_value: "0",
          avg_amount:average_order_value
        };
        final_list.push(u_data);
      }
    }
    count++;
    if (count == visit_details_data.length) return res.json({ status: true, message: "Data", result: final_list });
  }
});

router.post('/creating_pending_visits',async (req,res)=>{
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let date = get_current_date().split(" ")[0];
  let retailer_id_arr = req.body.retailer_id_arr?req.body.retailer_id_arr:[];
  let beat_id = req.body.beat_id?req.body.beat_id:"";
  if(retailer_id_arr.length== 0) 
  {
    return res.json({status:true,message:'No pending visits',result:[]})
  }
  if(beat_id=="") return res.json({status:false,message:'Please give beat id'})
  let count = 0
  for(let i = 0;i<retailer_id_arr.length;i++){
    let data = await Visit.findOne({
      beat_id: beat_id,
      retailer_id: retailer_id_arr[i],
      visit_date: date,
      emp_id: employee_id,
    })
    console.log(data);
    if(!data){
      let new_visit = new Visit({
        emp_id: employee_id,
        beat_id: beat_id,
        retailer_id: retailer_id_arr[i],
        visit_status: "Pending",
        visit_date: date,
        Created_date: get_current_date(),
        Updated_date: get_current_date(),
        status: "Active",
      });
      let visit_data = await new_visit.save();
    }else{
      console.log("Already exists")
      if(count == retailer_id_arr.length-1 ) return res.json({status:true,message:'Pending visits created successfully for remaining'});
    }
    count++
    if(count == retailer_id_arr.length) return res.json({status:true,message:'Pending visits created successfully'});
  }
})

module.exports = router;
