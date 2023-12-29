const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
const Party = mongoose.model("Party");
const PartyType = mongoose.model("PartyType");
const PrimaryOrder = mongoose.model("PrimaryOrder");
const PartyGrouping = mongoose.model("PartyGrouping");
// const ProductVarient = mongoose.model("ProductVarient");
const PrimaryOrderItem = mongoose.model("PrimaryOrderItem");
const ProductCatagory = mongoose.model("ProductCatagory");
const PriceList = mongoose.model("PriceList");
const Mapping = mongoose.model("Mapping");
const Invoice = mongoose.model("Invoice");
const Brand = mongoose.model("Brand");
const Product = mongoose.model("Product");
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

router.post('/place_primary_order', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  if (!emp_data) return res.json({ status: false, message: "Employee not found" })
  let party_type_id = req.body.party_type_id ? req.body.party_type_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let line = req.body.line ? req.body.line : null;
  if (emp_data.status == "InActive" || emp_data.status == "UnApproved") return res.json({ status: false, message: `You are ${emp_data.status} . Please contact company.` })
  if (party_type_id == "") return res.json({ status: false, message: "Give party type" });
  if (party_id == "") return res.json({ status: false, message: "Give party " });
  if (line == null) return res.json({ status: false, message: "Please select atleast one product" });
  let date = get_current_date().split(" ")[0];
  let total_amount = 0;
  for (let i = 0; i < line.length; i++) {
    total_amount += line[i].product_price * line[i].quantity;
  }
  console.log("total_amount-----", total_amount)
  let supply_by;
  let supply_by_id;
  let mapped_party_data = await Mapping.findOne({ assigned_to_id: party_id, primary_type: "SS", assigned_to_type: "Distributor" })
  if (mapped_party_data) {
    supply_by = "ss",
      supply_by_id = mapped_party_data.primary_id
  } else {
    supply_by = "company";
    supply_by_id = emp_data.companyId
  }
  let new_order = await PrimaryOrder.create({
    emp_id: employee_id,
    company_id: emp_data.companyId,
    party_type_id: party_type_id,
    date: date,
    party_id: party_id,
    supply_by: supply_by,
    supply_by_id: supply_by_id,
    total_amount: total_amount,
    Created_date: get_current_date(),
    Updated_date: get_current_date(),
    status: "Active",
  });
  let list = [];
  for (let i = 0; i < line.length; i++) {
    let product_data = await Product.findOne({ _id: line[i].product_id })
    let new_primary_order_line = await PrimaryOrderItem.create({
      order_id: new_order._id,
      product_id: line[i].product_id,
      hsn_code: product_data.hsn_code,
      product_price: line[i].product_price,
      quantity: line[i].quantity,
      discount: line[i].discount,
      sub_total_price: line[i].product_price * line[i].quantity,
      Created_date: get_current_date(),
      Updated_date: get_current_date(),
      status: "Active",
    })
    list.push(new_primary_order_line);
  }
  return res.json({ status: true, message: "Order placed successfully", result: new_order, list })
});

router.post('/party_acc_to_partytype', async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  if (!emp_data) return res.json({ status: false, message: "Employee not found" })
  let partytype_id = req.body.partytype_id ? req.body.partytype_id : "";
  console.log('partytype_id------', partytype_id)
  if (partytype_id == "") return res.json({ status: false, message: "Please give party type" })
  let mapped_party_data = await Mapping.find({ primary_id: employee_id, primary_type: "Employee", assigned_to_type: "Party" })
  console.log("mapped_party_data----", mapped_party_data)
  let list = []
  for (let i = 0; i < mapped_party_data.length; i++) {
    // console.log(i)
    let party_data = await Party.findOne({ _id: mapped_party_data[i].assigned_to_id, partyType: partytype_id });
    console.log("party_data------", party_data)
    if (party_data) {

      let state_data = await Location.findOne({ id: party_data.state })
      let city_data = await Location.findOne({ id: party_data.city })
      var u_data = {
        id: party_data._id,
        state: {
          name: state_data.name,
          id: party_data.state,
        },
        city: {
          name: city_data.name,
          id: party_data.city,
        },
        firmName: party_data.firmName,
        partyType: party_data.partyType,
        pincode: party_data.pincode,
        partyid: `${party_data.company_code}${party_data.party_code}`,
        image: party_data.image,
        GSTNo: party_data.GSTNo,
        contactPersonName: party_data.contactPersonName,
        mobileNo: party_data.mobileNo,
        email: party_data.email,
        DOB: party_data.DOB,
        DOA: party_data.DOA,
        areas: party_data.address,
        status: party_data.status,
      };
      list.push(u_data);
    }
  }
  console.log('list---', list)
  return res.json({ status: true, message: "Data", result: list })
})

router.post('/edit_status_primary_order', async (req, res) => {
  let id = req.body.id ? req.body.id : "";
  if (id == "") return res.json({ status: false, message: "Please give id" })
  let approval_status = req.body.approval_status ? req.body.approval_status : "";
  if (approval_status == "") return res.json({ status: false, message: "Please give approval_status" })
  let data = await PrimaryOrder.findOneAndUpdate({ _id: id }, { $set: { approval_status } })
  return res.json({ status: true, message: "Updated successfully" })
})

router.post("/primary_order_product_data", async (req, res) => {
  console.log("start ----------------------------------------------------------------------------------->")
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.json({ status: false, message: "Token is required" });
  let x = token.split(".");
  if (x.length < 3)
    return res.send({ status: false, message: "Invalid token" });
  var decodedToken = jwt.verify(token, "test");
  var employee_id = decodedToken.user_id;
  let emp_data = await Employee.findOne({ _id: employee_id });
  let page = req.body.page ? req.body.page : "1";
  let partytype_id = req.body.partytype_id ? req.body.partytype_id : "";
  let party_id = req.body.party_id ? req.body.party_id : "";
  let party_data = await Party.findOne({ _id: party_id })
  let grp_data = await PartyGrouping.findOne({ party_id })
  let price;
  let pricelist_data;
  if (grp_data) {
    console.log('grp data hai iska---', grp_data);
    let mapped_pricelist_data = await Mapping.findOne({ primary_type: "PriceList", assigned_to_id: grp_data.grp_id, assigned_to_type: "PartyGroup" });
    if (mapped_pricelist_data) {
      pricelist_data = await PriceList.findOne({ _id: mapped_pricelist_data.primary_id });
    } else {
      //state ke according price lana hoga
      let mapped_state_data = await Mapping.findOne({ primary_type: "PriceList", assigned_to_id: party_data.state, assigned_to_type: "State" });
      pricelist_data = await PriceList.findOne({ _id: mapped_state_data.primary_id });
    }
  } else {
    //state ke according price lana hoga
    console.log('state ke according---', party_data.state)
    let mapped_state_data = await Mapping.findOne({ company_id: emp_data.companyId, primary_type: "PriceList", assigned_to_id: party_data.state, assigned_to_type: "State" });
    if (mapped_state_data) {
      pricelist_data = await PriceList.findOne({ _id: mapped_state_data.primary_id });
      console.log('pricelist_data---', pricelist_data);
    }
  }
  let final_list = [];
  let limit = 10;
  let count = await ProductCatagory.find({ $and: [{ company_id: emp_data.companyId }, { is_delete: "0" }] });
  let catagory_data = await ProductCatagory.find({ $and: [{ company_id: emp_data.companyId }, { is_delete: "0" }] }).limit(limit * 1).sort((page - 1) * limit);
  if (catagory_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
  let countInfo = 0;
  for (let j = 0; j < catagory_data.length; j++) {
    console.log(countInfo);
    let list = [];
    arr = [{ company_id: emp_data.companyId }, { catagory_id: catagory_data[j]._id }]
    let product_data = await Product.find({ $and: arr });
    if (product_data.length > 0) {
      for (let i = 0; i < product_data.length; i++) {
        let catagory_data = await ProductCatagory.findOne({ _id: product_data[i].catagory_id });
        let brand_data = await Brand.findOne({ _id: product_data[i].brand_id });
        // console.log('pricelist_data----',pricelist_data);
        if (pricelist_data) {
          console.log('price list data found');
          for (let a = 0; a < pricelist_data.pricelist_details.length; a++) {
            console.log('inside for');
            if (product_data[i]._id == pricelist_data.pricelist_details[a].id) {
              console.log('inside if 1');
              if (partytype_id == pricelist_data.pricelist_details[a].partyType1.id) {
                console.log('inside if 11');
                price = Number(pricelist_data.pricelist_details[a].partyType1.value)
              } else if (partytype_id == pricelist_data.pricelist_details[a].partyType2.id) {
                console.log('inside else if ');
                price = Number(pricelist_data.pricelist_details[a].partyType2.value)
              } else {
                console.log('inside else');
                price = Number(product_data[i].price)
              }
            }
          }
        } else {
          console.log('price list data not found--');
          price = Number(product_data[i].price)
        }
        console.log('price---', price);
        var u_data1 = {
          id: product_data[i]._id,
          name: product_data[i].productName,
          brand_name: brand_data.name,
          hsn_code: product_data[i].hsn_code,
          catagory_name: catagory_data.name,
          description: product_data[i].description,
          gst: product_data[i].gst,
          image: product_data[i].display_image,
          mrp: product_data[i].mrp,
          price: price,
          packing_details: product_data[i].packing_details[0] ? JSON.parse(product_data[i].packing_details[0]) : [],
          status: product_data[i].status,
        };
        list.push(u_data1);
      }
      var u_data2 = {
        catagory_id: catagory_data[j]._id,
        catagory_name: catagory_data[j].name,
        product_details: list
      };
      final_list.push(u_data2)
    } else {
      var u_data2 = {
        catagory_id: catagory_data[j]._id,
        catagory_name: catagory_data[j].name,
        product_details: []
      };
      final_list.push(u_data2)
    }
    countInfo++
    console.log("last gdlkgjdlfkgjdflkg --------------------------------------------------------<", final_list.map(pro => pro.product_details))
    if (countInfo == catagory_data.length) return res.json({ status: true, message: "Catagories found.", result: final_list, pagelength: Math.ceil(count.length / limit) })

  }
});

module.exports = router;