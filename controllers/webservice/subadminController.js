const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const base_url = "http://salesparrow.herokuapp.com/";
const multer = require("multer");
const subAdmin = mongoose.model("subAdminInfo");
const Location = mongoose.model("Location");
const nodemailer = require("nodemailer");
const sgmail = require("@sendgrid/mail");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

const imageStorage = multer.diskStorage({
  destination: "images/subAdmin_image",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
});

router.post("/addSubAdmin",imageUpload.fields([{name:"subAdmin_image"}]), (req, res) => {
  console.log(req.body);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];
  if(!token){
    return res.json({
      status:false,
      message:"Token must be provided"
    })
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  var name = req.body.name ? req.body.name : "";
  var role = req.body.role ? req.body.role : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  // var district = req.body.district ? req.body.district : "";
  var phone = req.body.phone ? req.body.phone : "";
  var password = req.body.password ? req.body.password : "";
  var pincode = req.body.pincode ? req.body.pincode : "";
  var email = req.body.email ? req.body.email : "";
  var address = req.body.address ? req.body.address : "";
  if (name != "") {
    if (phone != "") {
      if (password != "") {
        if (email != "") {
          if (address != "") {
            subAdmin.find({ email: email }).exec().then((email_info) => {
                if (email_info.length < 1) {
                  bcrypt.hash(password, 10, function (err, hash) {
                    var new_subadmin = new subAdmin({
                      name: name,
                      phone: phone,
                      password: hash,
                      state: state,
                      city: city,
                      pincode: pincode,
                      image:base_url + req.files.subAdmin_image[0].path,
                      // district: district,
                      email: email,
                      company_id:company_id,
                      role:role,
                      address: address,
                      Created_date: get_current_date(),
                      Updated_date: get_current_date(),
                      status: "Active",
                    });
                    new_subadmin.save().then((data) => {
                      res.status(200).json({
                        status: true,
                        message: "New subAdmin is created successfully",
                        results: data,
                      });
                    });
                  });
                } else {
                  res.status(401).json({
                    status: true,
                    message: "Email already exists",
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
        } else {
          return res.json({
            status: false,
            message: "Email is required",
            results: null,
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Password is required",
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
      message: "Name is required",
      results: null,
    });
  }
});

router.post("/editSubAdmin", (req, res) => {
  var id = req.body.id ? req.body.id : "";
    if (id != "") {
      subAdmin.find({ _id: id }).exec().then(async (admin_info) => {
        if (admin_info.length> 0) {
            console.log(req.body);
            var updated_subadmin = {};
            if (req.body.name) {
              updated_subadmin.name = req.body.name;
            }
            if (req.body.status) {
              updated_subadmin.status = req.body.status;
            }
            if (req.body.is_delete) {
              updated_subadmin.is_delete = req.body.is_delete;
            }
            if (req.body.phone) {
              updated_subadmin.phone = req.body.phone;
            }
            if (req.body.email) {
              updated_subadmin.email = req.body.email;
            }
            if (req.body.role) {
              updated_subadmin.role = req.body.role;
            }
            if (req.body.city) {
              updated_subadmin.city = req.body.city;
            }
            if (req.body.state) {
              updated_subadmin.state = req.body.state;
            }
            if (req.body.pincode) {
              updated_subadmin.pincode = req.body.pincode;
            }
            if (req.body.password) {
                const hash =await bcrypt.hash(req.body.password, 10);
                console.log(hash);  
                updated_subadmin.password = hash;
            }
            req.body["Updated_date"] = get_current_date();
            subAdmin.findOneAndUpdate({ _id: id },updated_subadmin,{ new: true },(err, doc) => {
                if (doc) {
                  res.status(200).json({
                    status: true,
                    message: "Update successfully",
                    results: updated_subadmin,
                  });
                }
              }
            );
          } else {
            res.json({
              status: false,
              message: "subAdmin not found.",
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

router.get('/getAllSubAdmins',async (req,res)=>{
  const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
      return res.json({
        status:false,
        message:"Token must be provided"
      })
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var list = [];
    var limit = 10;
    var page = req.body.page?req.body.page:"1"
    var count = await subAdmin.find({company_id})
    subAdmin.find({company_id}).limit(limit*1).skip((page-1)*limit).exec().then(subadmin_data=>{
      if(subadmin_data.length>0){
        let counInfo = 0;
      for(let i=0;i<subadmin_data.length;i++){
        Location.findOne({ _id: subadmin_data[i].state }).exec().then((state_data) => {
          Location.findOne({ _id: subadmin_data[i].city }).exec().then((city_data) => {
              // Location.findOne({ _id: subadmin_data[i].district }).exec().then(async (area_data) => {
                await (async function (rowData) {
                  var u_data = {
                    id:rowData._id,
                    name: rowData.name,
                    phone: rowData.phone,
                    email: rowData.email,
                    address: rowData.address,
                    pincode: rowData.pincode,
                    password: rowData.password,
                    state: state_data.name,
                    image: rowData.image,
                    city: city_data.name,
                    // district: area_data.name,
                  };
                  list.push(u_data);
                })(subadmin_data[i]);
                counInfo++
                if(counInfo == subadmin_data.length){
                  res.json({
                    status:true,
                    message:"All Employees found successfully",
                    result:list,
                    pageLength:Math.ceil(count.length/limit)
                  })
                }
                // });
            });
        });
    }
      }else{
        res.json({
          status:true,
          message:"subadmins not found",
          result:[]
      })
      }
    })
});

router.get('/getSubAdmin',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    subAdmin.find({_id:id}).exec().then(subadmin_data=>{
        res.json({
            status:true,
            message:"subadmin found successfully",
            result:subadmin_data
        })
    })
});

router.post('/forgotPassword',(req,res)=>{
  var id = req.body.id?req.body.id:"";
  subAdmin.findOne({_id:id}).exec().then(subAdmin_data=>{
    const token = jwt.sign({ user_id: subAdmin_data._id, is_token_valid: 1 },"test");
    const api_key =  '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';
    sgmail.setApiKey(api_key);
    const message = {
      to:subAdmin_data.email,
      from:{
        name:'SaleSparrow',
        email:'Saksham1840097@akgec.ac.in',
      },
      subject:'Regarding Password Change',
      //html:'<h1>Token</h1>', 
      text:token
    }
    sgmail.send(message).then((err,data)=>{
      if(err) {
        console.log(err);
    } else {
        console.log('Email sent successfully');
        res.json({
          status:true,
          message:"Check your Email",
        })
    }
    })
    /*const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        //api_key: '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',
        user: 'anamika.gautam@zoxima.com',
        pass: 'Kanpur@8787'
      }
    })
    let mailDetails = {
      from: 'anamika.gautam@zoxima.com',
      to: 'sakshamdubey469@gmail.com',
      subject: 'Password change',
      text: token
  };
   
  transporter.sendMail(mailDetails, function(err, data) {
      if(err) {
          console.log(err);
      } else {
          console.log('Email sent successfully');
      }
  });*/
    res.json({
      status:true,
      message:"Check your Email",
    })

  })
})

/*router.post('/role',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    var role = req.body.role?req.body.role:""
    if(id!=""){
        Admin.find({_id:id}).exec().then(admin_data=>{
            if(admin_data){
                var updated_admin = {};
                if(role!=""){
                    updated_admin.role = role;

                }else{
                    res.json({
                        status:false,
                        message:"Please specify the status",
                    })
                }
                req.body["Updated_date"] = get_current_date();
                Admin.findOneAndUpdate({ _id: id },updated_admin,{ new: true },(err, doc) => {
                    if (doc) { 
                      res.status(200).json({
                        status: true,
                        message: "Update successfully",
                        results: updated_admin,
                      });
                    }
                  }
                );
            }else{
                res.json({
                    status:false,
                    message:"No such user exists",
                })
            }
        })
    }else{
        res.json({
            status:false,
            message:"plz specify the person",
        })
    }
});*/

router.post('/resetPassword',(req,res)=>{
  var token = req.body.token?req.body.token:"";
  var password = req.body.password?req.body.password:"";
  if(token!=""){
    if(password!=""){
      const decodedToken = jwt.verify(token,"test");
      const subAdmin_id = decodedToken.user_id;
      subAdmin.findOne({_id:subAdmin_id}).exec().then(data=>{
        bcrypt.hash(password,10,function(err,hash){
          var updated_subadmin = {};
          updated_subadmin.password = hash;
          subAdmin.findOneAndUpdate({_id:subAdmin_id},updated_subadmin,{ new: true },(err, doc)=>{
            res.json({
              status:true,
              message:"Password updated successfully",
              details:data
            })
          })
        }) 
      })
    }else{
      res.json({
        status:false,
        message:"Password is required"
      })
    }
  }else{
    res.json({
      status:false,
      message:"Token is required"
    })
  }
})
module.exports = router;
