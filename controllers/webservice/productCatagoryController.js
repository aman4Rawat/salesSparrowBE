const express = require("express");
const mongoose = require("mongoose");
const ProductCatagory = mongoose.model("ProductCatagory");
const Product = mongoose.model("Product");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');

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
  destination: "images/catagory_img",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
}).single("catagory_image");

router.post("/addProductCatagory",async (req, res) => {
    try {
        imageUpload(req, res, async (err) => {
            console.log("file",req.file);
            console.log("body",req.body);
            if (!req.file) {
                return res.status(201).json({ status: true, message: "File not found"});
            }
            // console.log(req.file);
            if (err) return console.log("error uploading the image.");
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3)
      return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var name = req.body.name ? req.body.name : "";
    // var p_id = req.body.p_id ? req.body.p_id : "";
    var gst = req.body.gst ? req.body.gst : "";
    var status = req.body.status ? req.body.status : "";
    if (name == "")
      return res.json({ status: false, message: "Name is required" });
    let catagory_data = await ProductCatagory.find({$and:[{company_id},{ name }]});
    if (catagory_data.length > 0)
      return res.json({
        status: false,
        message: "Product catagory already exists",
      });
    var new_product_catagory = new ProductCatagory({
      name: name,
      gst: gst,
      image: `${base_url}${req.file.path}`,
      company_id: company_id,
      // p_id:p_id,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: status,
    });
    new_product_catagory.save().then((data) => {
      res.status(200).json({
        status: true,
        message: "Product Catagory added successfully",
        details: data,
      });
    });
        });
    } catch (error) {
        return console.log(error);
    }
  }
);

router.post("/editProductCatagory", (req, res) => {
    imageUpload(req, res, async (err) => {
    var id = req.body.id ? req.body.id : "";
    if (id == "") return res.json({status:false,message:"Id is required"});
      ProductCatagory.find({ _id: id }).exec().then((unit_data) => {
          var updated_product_catagory = {};
            console.log("file",req.file);
            console.log("body",req.body);
            if (req.file) {

                updated_product_catagory.image =`${base_url}${req.file.path}`;
            }
            if (req.body.name) {
                updated_product_catagory.name = req.body.name;
              }
              if (req.body.status) {
                updated_product_catagory.status = req.body.status;
              }
              if (req.body.gst) {
                updated_product_catagory.gst = req.body.gst;
              }
              updated_product_catagory.Updated_date = get_current_date();
              ProductCatagory.findOneAndUpdate(
                { _id: id },
                updated_product_catagory,
                { new: true },
                (err, doc) => {
                  if (doc) {
                    res.status(200).json({
                      status: true,
                      message: "Updated successfully",
                      details: updated_product_catagory,
                    });
                  } else {
                    res.json({
                      status: false,
                      message: "Error occured during updation",
                      details: err,
                    });
                  }
                }
              );
        })
    })
});

router.post("/get_all_product_catagory",async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3)
      return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    // let p_id = req.body.p_id?req.body.p_id:"";
    let page = req.body.page?req.body.page:"1";
    // let list = [];
    let limit = 10;
  //   if(p_id!=""){
  //       let count = await ProductCatagory.find({$and:[{company_id},{p_id},{is_delete:"0"}]});
  //       let sub_catagory_data = await ProductCatagory.find({$and:[{company_id},{p_id},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
  //       if(sub_catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
  //       let counInfo = 0;
  //       for(let i = 0;i<sub_catagory_data.length;i++){
  //         let catagory_data  = await ProductCatagory.findOne({_id:sub_catagory_data[i].p_id});
  //         await (async function (rowData) {
  //           var u_data = {
  //             id: rowData._id,
  //             name: rowData.name,
  //             gst: rowData.gst,
  //             image: rowData.image,
  //             catagory:catagory_data.name,
  //             status: rowData.status,
  //         };
  //         list.push(u_data);
  //         })(sub_catagory_data[i]);
  //         counInfo++;
  //         if(counInfo==sub_catagory_data.length) return res.json({status: true,message: "All sub catagories found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
  //   }
  // }else{
  //       let count = await ProductCatagory.find({$and:[{company_id},{p_id:""},{is_delete:"0"}]});
  //       let catagory_data = await ProductCatagory.find({$and:[{company_id},{p_id:""},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
  //       if(catagory_data.length>0) return res.json({status:true,message:"Catagories found.",result:catagory_data,pagelength:Math.ceil(count.length/limit)})
  //       if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
  //   }
  let count = await ProductCatagory.find({$and:[{company_id},{is_delete:"0"}]});
  let catagory_data = await ProductCatagory.find({$and:[{company_id},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
  console.log(catagory_data);
  if(catagory_data.length>0) return res.json({status:true,message:"Catagories found.",result:catagory_data,pagelength:Math.ceil(count.length/limit)})
  if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
});

router.delete('/delete_catagory',async (req,res)=>{
  let id = req.body.id?req.body.id:"";
  if(id=="") return res.json({status:false,message:"Please give id"});
  // let sub_catagory_data = await ProductCatagory.find({p_id:id});
  // console.log(sub_catagory_data);
  // for(let i = 0;i<sub_catagory_data.length;i++){
  //   console.log(i);
  //   await ProductCatagory.findOneAndUpdate({_id:sub_catagory_data[i]._id},{$set:{is_delete:"1"}});
  // }
  let product_data = await Product.find({catagory_id:id})
  if(product_data.length>0){
    return res.json({status:false,message:"Please delete the products of this catagory"});
  }else{
    ProductCatagory.findOneAndUpdate({_id:id},{$set:{is_delete:"1"}}).exec().then(()=>{
      return res.json({status:true,message:"Deleted successfully"});
    })
  }
})

// router.delete('/delete_sub_catagory',async (req,res)=>{
//   let id = req.body.id?req.body.id:"";
//   if(id=="") return res.json({status:false,message:"Please give id"});
//   ProductCatagory.findOneAndUpdate({_id:id},{$set:{is_delete:"1"}}).exec().then(()=>{
//     res.json({status:true,message:"Deleted successfully"});
//   })
// })

router.post("/catagory_search",async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  // let p_id = req.body.p_id?req.body.p_id:"";
  let page = req.body.page?req.body.page:"1";
  // let list = [];
  let limit = 10;
//   if(p_id!=""){
//       let count = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id},{is_delete:"0"}]});
//       let sub_catagory_data = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
//       if(sub_catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
//       let counInfo = 0;
//       for(let i = 0;i<sub_catagory_data.length;i++){
//         let catagory_data  = await ProductCatagory.findOne({_id:sub_catagory_data[i].p_id});
//         await (async function (rowData) {
//           var u_data = {
//             id: rowData._id,
//             name: rowData.name,
//             gst: rowData.gst,
//             image: rowData.image,
//             catagory:catagory_data.name,
//             status: rowData.status,
//         };
//         list.push(u_data);
//         })(sub_catagory_data[i]);
//         counInfo++;
//         if(counInfo==sub_catagory_data.length) return res.json({status: true,message: "All sub catagories found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
//   }
// }else{
//       let count = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id:""},{is_delete:"0"}]});
//       let catagory_data = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id:""},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
//       if(catagory_data.length>0) return res.json({status:true,message:"Catagories found.",result:catagory_data,pagelength:Math.ceil(count.length/limit)})
//       if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
//   }
let count = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id:""},{is_delete:"0"}]});
let catagory_data = await ProductCatagory.find({$and:[{name:{ $regex: new RegExp(req.body.search,"i") }},{company_id},{p_id:""},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
if(catagory_data.length>0) return res.json({status:true,message:"Catagories found.",result:catagory_data,pagelength:Math.ceil(count.length/limit)})
if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
});

module.exports = router;
