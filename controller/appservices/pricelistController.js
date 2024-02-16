const express = require("express");
const mongoose = require("mongoose");
const PriceList = mongoose.model("PriceList");
const Employee = mongoose.model("Employee");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post('/get_all_pricelist', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });

    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({ _id: employee_id })
    let company_id = emp_data.companyId

    let page = req.body.page ? req.body.page : "1";
    let search = req.body.search ? req.body.search : "";
    let limit = req.body.limit ? req.body.limit : 10;

    let partyType_id = req.body.partyType_id ? req.body.partyType_id : "";
    let category_id = req.body.category_id ? req.body.category_id : "";
    let arr = [{ is_delete: "0" }, { company_id }]
    let arr2 = [];
    // if (partyType_id !== "") {
    //     arr2.push({ "party_type_one.id": partyType_id }, { "party_type_two.id": partyType_id })
    // }
    if (category_id !== "") {
        arr.push({ pricelist_details: { $elemMatch: { catagory_name: category_id } } })
    }
    if (search != "") {
        var regex = new RegExp(search, 'i');
        arr.push({ price_list_name: regex })
    }
    let count, price_list_data;
    if (partyType_id !== "") {
        count = await PriceList.countDocuments({ $and: arr, $or: [{ "party_type_one.id": partyType_id }, { "party_type_two.id": partyType_id }] });
        price_list_data = await PriceList.find({ $and: arr, $or: [{ "party_type_one.id": partyType_id }, { "party_type_two.id": partyType_id }] }).limit(limit * 1).skip((page - 1) * limit);
    } else {
        count = await PriceList.countDocuments({ $and: arr });
        price_list_data = await PriceList.find({ $and: arr }).limit(limit * 1).skip((page - 1) * limit);
    }
    if (price_list_data.length < 1) return res.json({ status: true, message: "No data", result: [] });
    price_list_data.map((list) => list.pricelist_details.map(details => details.packing_details = JSON.parse(details.packing_details)))
    return res.json({ status: true, message: "data", result: price_list_data, count, pageLength: Math.ceil(count / limit) })
})
router.post('/get_all_pricelist/:id', async (req, res) => {
    let pricelist = await PriceList.findById(req.params.id).lean();
    console.log('first', pricelist)
    pricelist.pricelist_details.map(details => details.packing_details = JSON.parse(details.packing_details));
    return res.json({ status: true, message: "data", result: pricelist })
})

router.delete('/delete_price_list', async (req, res) => {
    let id = req.body.id ? req.body.id : "";
    if (id == "") return res.json({ status: false, message: "Please select id" });
    await PriceList.findOneAndUpdate({ _id: id }, { $set: { is_delete: "1" } })
    return res.json({ status: true, message: "Deleted successfully" })
})

module.exports = router;