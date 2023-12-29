const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Brand = mongoose.model("Brand");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
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

const imageStorage = multer.diskStorage({
  destination: "images/brand_img",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
}).single("brand_image");

router.post("/add_brand", async (req, res) => {
  imageUpload(req, res, async (err) => {
    console.log("file", req.file);
    console.log("body", req.body);
    if (!req.file) return res.status(201).json({ status: true, message: "File not found" });
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let name = req.body.name ? req.body.name : "";
    let status = req.body.status ? req.body.status : "";
    if (name == "") return res.json({ status: false, message: "Please give brand name" });
    let brand_data = await Brand.find({ $and: [{ company_id }, { name }] });
    if (brand_data.length > 0)
      return res.json({
        status: false,
        message: "Brand name already present.",
      });
    let new_brand = new Brand({
      name: name,
      company_id: company_id,
      image: `${base_url}${req.file.path}`,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: status,
    });
    let data = await new_brand.save();
    if (data)
      return res.json({
        status: true,
        message: "Brand created successfully",
        result: data,
      });
    if (!data)
      return res.json({ status: false, message: "Some error in insersion" });
  });
});

router.post("/get_all_brands", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let page = req.body.page ? req.body.page : "";
  let limit = 10;
  if (page != "") {
    let count = await Brand.find({ company_id });
    let brand_data = await Brand.find({ company_id }).limit(limit * 1).skip((page - 1) * limit);
    if (brand_data.length < 1) return res.json({ status: true, message: "No brand found", result: [] });
    if (brand_data.length > 0) return res.json({ status: true, message: "Brands found", result: brand_data, pageLength: Math.ceil(count.length / limit), });
  } else {
    let brand_data = await Brand.find({ company_id });
    if (brand_data.length < 1) return res.json({ status: true, message: "No brand found", result: [] });
    if (brand_data.length > 0) return res.json({ status: true, message: "Brands found", result: brand_data });
  }
});

router.post("/brand_search", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let page = req.body.page ? req.body.page : "1";
  let limit = 10;
  let count = await Brand.find({ company_id });
  let brand_data = await Brand.find({ $and: [{ name: { $regex: new RegExp(req.body.search, "i") } }, { company_id }] }).limit(limit * 1).skip((page - 1) * limit);
  if (brand_data.length < 1) return res.json({ status: true, message: "No brand found", result: [] });
  if (brand_data.length > 0) return res.json({ status: true, message: "Brands found", result: brand_data, pageLength: Math.ceil(count.length / limit), });
});

router.post("/edit_brand", async (req, res) => {
  imageUpload(req, res, async (err) => {
    let id = req.body.id ? req.body.id : "";
    if (id == "") return res.json({ status: false, message: "Please give id" });
    let brand_data = await Brand.findOne({ _id: id });
    if (!brand_data) return res.json({ status: true, message: "Please check id" });
    let updated_brand = {};
    if (req.body.name) { updated_brand.name = req.body.name; }
    if (req.body.status) { updated_brand.status = req.body.status; }
    if (req.file) { updated_brand.image = `${base_url}${req.file.path}`; }
    updated_brand.Updated_date = get_current_date();
    Brand.findByIdAndUpdate({ _id: id }, updated_brand, { new: true }, (err, data) => {
      if (data) return res.json({ status: true, message: "Updated successfully", result: updated_brand, });
      if (err) return res.json({ status: false, message: "Some error" });
    });
  });
});

router.delete("/delete_brand", (req, res) => {
  let id = req.body.id ? req.body.id : "";
  if (id == "")
    return res.json({ status: false, message: "Please provide Id" });
  Brand.deleteOne({ _id: id })
    .exec()
    .then(() => {
      res.json({ status: true, message: "Deleted successfully" });
    });
});

module.exports = router;
