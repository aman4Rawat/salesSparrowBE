const express = require("express");
const mongoose = require("mongoose");
const PriceList = mongoose.model("PriceList");
const Admin = mongoose.model('AdminInfo');
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

router.post('/add_price_list', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let admin = await Admin.findById(company_id);
  let pricelistCount = await PriceList.countDocuments({ company_id })

  if (pricelistCount > 0) {
    let date = new Date().getTime();
    let startDate = new Date(admin.sfa?.startDate).getTime();
    let endDate = new Date(admin.sfa?.endDate).getTime();

    if (startDate && endDate) {
      if (startDate < date && endDate > date) {
        if (admin.sfa.plan.features !== "standard") return res.json({ status: false, message: "Module is not purchased!" })
      } else {
        return res.json({ status: false, message: "Module is not purchased!" })
      }
    } else {
      return res.json({ status: false, message: "Module is not purchased!" })
    }
  }

  let price_list_name = req.body.price_list_name ? req.body.price_list_name : "";
  let party_type_one = req.body.party_type_one ? req.body.party_type_one : "";
  let party_type_two = req.body.party_type_two ? req.body.party_type_two : "";
  let pricelist_details = req.body.pricelist_details ? req.body.pricelist_details : null;
  if (price_list_name == "") return res.json({ status: true, message: "Price list name required" })
  if (party_type_one == "") return res.json({ status: true, message: "Party type one name required" })
  if (party_type_two == "") return res.json({ status: true, message: "Party type two name required" })
  if (pricelist_details == null) return res.json({ status: true, message: "Price list details required" })
  let price_list_data = await PriceList.find({ price_list_name });
  if (price_list_data.length > 0) return res.json({ status: false, message: "Price list name already exists" });
  let new_price_list = new PriceList({
    price_list_name: price_list_name,
    party_type_one: party_type_one,
    party_type_two: party_type_two,
    pricelist_details: pricelist_details,
    company_id: company_id,
    Created_date: get_current_date(),
    Updated_date: get_current_date(),
    status: "Active",
  })
  let data = await new_price_list.save();
  return res.json({ status: true, message: "Price list created successfully", result: data })
});

router.post('/edit_price_list', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  if (id == "") return res.json({ status: false, message: "Please select id" });
  let price_list_data = await PriceList.findOne({ _id: id });
  if (!price_list_data) return res.json({ status: false, message: "Please check id", result: [] });
  let updated_price_list = {}
  if (req.body.price_list_name) {
    updated_price_list.price_list_name = req.body.price_list_name
  }
  if (req.body.party_type_one) {
    updated_price_list.party_type_one = req.body.party_type_one
  }
  if (req.body.party_type_two) {
    updated_price_list.party_type_two = req.body.party_type_two
  }
  if (req.body.status) {
    updated_price_list.status = req.body.status
  }
  if (req.body.pricelist_details) {
    updated_price_list.pricelist_details = req.body.pricelist_details
  }
  updated_price_list.Updated_date = get_current_date();
  let data = await PriceList.findByIdAndUpdate({ _id: id }, updated_price_list, { new: true });
  return res.json({ status: true, message: "Updated successfully", result: updated_price_list });
})

router.post('/get_all_pricelist', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let page = req.body.page ? req.body.page : "1";
  let search = req.body.search ? req.body.search : "";
  let limit = req.body.limit ? req.body.limit : 10;
  let arr = [{ is_delete: "0" }, { company_id }]
  if (search != "") {
    var regex = new RegExp(search, 'i');
    arr.push({ price_list_name: regex })
  }
  let count = await PriceList.find({ $and: arr });
  let price_list_data = await PriceList.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
  if (price_list_data.length < 1) return res.json({ status: true, message: "No data", result: [] });
  return res.json({ status: true, message: "data", result: price_list_data, count: count.length, pageLength: Math.ceil(count.length / limit) })
})

router.post('/get_all_pricelist/:id', async (req, res) => {
  let pricelist = await PriceList.findById(req.params.id);
  return res.json({ status: true, message: "data", result: pricelist })
})

router.delete('/delete_price_list', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  if (id == "") return res.json({ status: false, message: "Please select id" });
  await PriceList.findByIdAndDelete(id)
  return res.json({ status: true, message: "Deleted successfully" })
})

module.exports = router;