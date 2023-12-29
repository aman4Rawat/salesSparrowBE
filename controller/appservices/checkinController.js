const express = require("express");
const mongoose = require("mongoose");
const Check = mongoose.model("Check");
const demo = mongoose.model("demo");
const Employee = mongoose.model("Employee");
const SalesReport = mongoose.model("SalesReport");
const router = express.Router();
const jwt = require("jsonwebtoken");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");



function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

router.post('/check_in',async (req,res)=>{
    console.log(req.body);
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({status: false,message: "Token must be provided",});
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let location = req.body.location?req.body.location:null;
    let employee = await Employee.findOne({_id:employee_id});
    if(!employee) return res.json({status: false,message: "Employee not found",});
    if(employee.status == "InActive" || employee.status == "UnApproved") return res.json({status: false,message: `you are ${employee.status}. Contact company.`,});
    if(location==null) return res.json({status:false,message:"Provide the location"});
    // let today= new Date().toLocaleDateString("en-IN", {
    //   year: "2-digit",
    //   month: "2-digit",
    //   day: "2-digit",
    //   hour: "2-digit",
    //   minute: "2-digit",    
    // })
    // let a = today.split(",")
    let date = get_current_date().split(" ")[0];
    // var time =a[1];
    // console.log(time);
    let check =await Check.findOne({$and:[{check_in_date:date},{emp_id:employee_id}]});
    if(check) return res.json({status:false,message:"Already checked in",result:check})
    let new_check_in = new Check({
        emp_id:employee_id,
        check_in_time:new Date(),
        check_in_date:date,
        location:location,
        Created_date:get_current_date(),
        Updated_date:get_current_date(),
        status:"Active"
    });
    new_check_in.save().then((doc)=>{
        if(doc) return res.json({status:true,message:"Check_In Successful",result:doc})
    })
});

const imageStorage = multer.diskStorage({
  destination: "images/demo_images",
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

// router.post("/add_demo_banner", imageUpload.fields([{ name: "demo_image" }]), async (req, res) => {
//   console.log(req.body);
//   var name = req.body.name ? req.body.name : "";
//   if (name != "") {
//     var existing_demo_banner_data = await demo.find({ name });
//     if (existing_demo_banner_data.length > 0) {
//       return res.json({ status: false, message: "Banner already exists" })
//     }
//     var new_demo_banner = new demo({
//       name: name,
//       image: base_url + req.files.demo_image[0].path,
//     });
//     new_demo_banner.save().then((data) => {
//       res.status(200).json({
//         status: true,
//         message: "Banner created successfully",
//         result: data,
//       });
//     });

//   } else {
//     res.json({
//       status: false,
//       message: "name is required",
//     });
//   }
// }
// );

// router.get('/get_demo_banners',async (req,res)=>{
//   let banner_data = await demo.find();
//   if(banner_data.length<1) return res.json({status:false,message:"No data found"});
//   return res.json({status:true,message:"Data found",result:banner_data})
// })

router.post('/checkout',async (req,res)=>{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({status: false,message: "Token must be provided",});
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let employee = await Employee.findOne({_id:employee_id});
  if(!employee) return res.json({status: false,message: "Employee not found",});
  let date = get_current_date().split(" ")[0]
  // let sales_report_data = await SalesReport.find({sales_report_date:date,employee_id})
  // if(sales_report_data.length<1) return res.json({status:false,message:"Sales report not submitted yet"})
  let location = req.body.location?req.body.location:[];
  let check =await Check.findOneAndUpdate({check_in_date:date,emp_id:employee_id},{$set:{check_out_time:new Date(),check_out_date:date,location2:location}})
  return res.json({status:true,message:"Checkout successful"})
})


module.exports = router;