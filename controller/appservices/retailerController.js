const express = require("express");
const mongoose = require("mongoose");
const Retailer = mongoose.model("Retailer");
const Employee = mongoose.model("Employee");
const Feedback = mongoose.model("Feedback");
const Admin = mongoose.model("AdminInfo");
const Party = mongoose.model("Party");
const CustomerType = mongoose.model("CustomerType");
const Beat = mongoose.model("Beat");
const Route = mongoose.model("Route");
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
};

router.post('/addRetailer', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
            status: false,
            message: "Token must be provided"
        })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    //    let beat_id= req.body.beat_id?req.body.beat_id:""
    let customer_type = req.body.customer_type ? req.body.customer_type : ""
    let pincode = req.body.pincode ? req.body.pincode : ""
    let address = req.body.address ? req.body.address : ""
    let firmName = req.body.firmName ? req.body.firmName : ""
    let GSTNo = req.body.GSTNo ? req.body.GSTNo : ""
    let customerName = req.body.customerName ? req.body.customerName : ""
       let state= req.body.state?req.body.state:""
       let city= req.body.city?req.body.city:""
    let lat = req.body.lat ? req.body.lat : ""
    let long = req.body.long ? req.body.long : ""
    let route_id = req.body.route_id ? req.body.route_id : ""
    let mobileNo = req.body.mobileNo ? req.body.mobileNo : ""
    let date = get_current_date().split(" ")[0]
    let DOB = req.body.DOB ? req.body.DOB : ""
    let DOA = req.body.DOA ? req.body.DOA : ""
    if (customer_type != "") {
        if (firmName != "") {
            if (customerName != "") {
                if (lat != "") {
                    if (long != "") {
                        if (mobileNo != "") {
                            var existing_employee_data = await Employee.find({$or:[{ phone: mobileNo}]});
                            var existing_admin_data = await Admin.find({$or:[{ phone: mobileNo}]});
                            var existing_retailer_data = await Retailer.find({ mobileNo: mobileNo });
                            var existing_party_data = await Party.find({$or:[{ mobileNo: mobileNo}]});
                            if (existing_employee_data.length > 0) {
                                return res.json({ status: false, message: "Phone number already exists" })
                            }
                            if (existing_admin_data.length > 0) {
                                return res.json({ status: false, message: "Phone number already exists" })
                            }
                            if (existing_retailer_data.length > 0) {
                                return res.json({ status: false, message: "Phone number already exists" })
                            }
                            if (existing_party_data.length > 0) {
                                return res.json({ status: false, message: "Phone number already exists" })
                            }
                            Employee.findOne({ _id: employee_id }).exec().then(emp_data => {
                                if (emp_data.status == "InActive" || emp_data.status == "UnApproved") {
                                    return res.json({
                                        status: false,
                                        message: "You are Inactive. Please contact company."
                                    })
                                } else {
                                    let new_retailer = new Retailer({
                                        // beat_id:beat_id,
                                        customer_type: customer_type,
                                        company_id: emp_data.companyId,
                                        employee_id: emp_data._id,
                                        pincode: pincode,
                                        address: address,
                                        firmName: firmName,
                                        date:date,
                                        GSTNo: GSTNo,
                                        customerName: customerName,
                                        city:city,
                                        state:state,
                                        lat: lat,
                                        long: long,
                                        route_id: route_id,
                                        mobileNo: mobileNo,
                                        DOB: DOB,
                                        DOA: DOA,
                                        Created_date: get_current_date(),
                                        Updated_date: get_current_date(),
                                        status: "Active"
                                    });
                                    new_retailer.save().then(data => {
                                        res.json({
                                            status: true,
                                            message: "Retailer created successfully",
                                            result: data
                                        })
                                    })
                                }
                            })
                        } else {
                            res.json({
                                status: false,
                                message: "Mobile number must be given"
                            })
                        }
                    } else {
                        res.json({
                            status: false,
                            message: "longitude must be selected"
                        })
                    }
                } else {
                    res.json({
                        status: false,
                        message: "Latitude must be selected"
                    })
                }
            } else {
                res.json({
                    status: false,
                    message: "customerName must be selected"
                })
            }
        } else {
            res.json({
                status: false,
                message: "Firm name must be given"
            })
        }
    } else {
        res.json({
            status: false,
            message: "Customer Type must be selected"
        })
    }
})

router.post('/getAllRetailers', async (req, res) => {
    let beat = req.body.beat ? req.body.beat : "";
    let arr = [];
    // let list2 = [];
    let limit = 10;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
            status: false,
            message: "Token must be provided"
        })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({ _id: employee_id })
    if (emp_data.status == "InActive" || emp_data.status == "UnApproved") {
        return res.json({
            status: false,
            message: "You are Inactive. Please contact company."
        })
    }

    company_id = emp_data.companyId;
    if (beat != "") {
        arr.push({ company_id }, { beat_id: beat })
    } else {
        arr.push({ company_id })
    }
    let count = await Retailer.find({ $and: arr });
    Retailer.find({ $and: arr }).exec().then(async (retailer_data) => {
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
                let beat_data = await Beat.findOne({ _id: retailer_data[i].beat_id })
                await (async function (rowData) {
                    let data = {
                        beat_id: beat_data.beatName,
                        customer_type: rowData.customer_type,
                        employee_id: emp_data.employeeName,
                        company_id: rowData.company_id,
                        pincode: rowData.pincode,
                        address: rowData.address,
                        firmName: rowData.firmName,
                        GSTNo: rowData.GSTNo,
                        customerName: rowData.customerName,
                        lat: rowData.lat,
                        long: rowData.long,
                        // state:state_data.name,
                        // city:city_data.name,
                        // route:list2,
                        mobileNo: rowData.mobileNo,
                        DOB: rowData.DOB,
                        DOA: rowData.DOA,
                        status: rowData.status,
                    }
                    list.push(data)
                })(retailer_data[i])
                // var arr = retailer_data[i].route? retailer_data[i].route[0].split(","): "";
                // if(arr == ""){
                //     let beat_data = await Beat.findOne({_id:retailer_data[i].beat_id})
                //     // let state_data = await Location.findOne({_id:retailer_data[i].state})
                //     // let city_data = await Location.findOne({_id:retailer_data[i].city})
                //         await (async function(rowData){
                //             let data ={
                //                 beat_id:beat_data.beatName,
                //                 customer_type:rowData.customer_type,
                //                 employee_id:emp_data.employeeName,
                //                 company_id:rowData.company_id,
                //                 pincode:rowData.pincode,
                //                 address:rowData.address,
                //                 firmName:rowData.firmName,
                //                 GSTNo:rowData.GSTNo,
                //                 customerName:rowData.customerName,
                //                 location:rowData.location,
                //                 // state:state_data.name,
                //                 // city:city_data.name,
                //                 // route:list2,
                //                 mobileNo:rowData.mobileNo,
                //                 DOB:rowData.DOB,
                //                 DOA:rowData.DOA,
                //                 status:rowData.status,
                //             }
                //             list.push(data)
                //         })(retailer_data[i])
                //     }else{
                //         for (let j = 0; j < arr.length; j++) {
                //             var route_data = await Route.findOne({ _id: arr[j] })
                //             console.log("routedata", route_data);
                //             let data = {
                //                 start_point: route_data.start_point,
                //                 end_point: route_data.end_point,
                //                 id: route_data._id,
                //             };
                //             list2.push(data);
                //             console.log(list2);
                //             if(arr.length == j+1){
                //                 let state_data = await Location.findOne({_id:retailer_data[i].state})
                //                 let city_data = await Location.findOne({_id:retailer_data[i].city})
                //                 let beat_data = await Beat.findOne({_id:retailer_data[i].beat_id})
                //                 await (async function(rowData){
                //                     let data ={
                //                         beat_id:beat_data.beatName,
                //                         customer_type:rowData.customer_type,
                //                         employee_id:emp_data.employeeName,
                //                         company_id:rowData.company_id,
                //                         pincode:rowData.pincode,
                //                         address:rowData.address,
                //                         firmName:rowData.firmName,
                //                         GSTNo:rowData.GSTNo,
                //                         customerName:rowData.customerName,
                //                         location:rowData.location,
                //                         state:state_data.name,
                //                         city:city_data.name,
                //                         route:list2,
                //                         mobileNo:rowData.mobileNo,
                //                         DOB:rowData.DOB,
                //                         DOA:rowData.DOA,
                //                         status:rowData.status,
                //                     }
                //                     list.push(data)
                //                 })(retailer_data[i])
                //             }
                //         }
                //     }
                countInfo++
                if (countInfo == retailer_data.length) {
                    return res.json({ status: true, message: "Retailers found successfully", result: list, pageLength: Math.ceil(count.length / limit) })
                }
            }
        }
    })
})

router.post('/submit_feedback', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
            status: false,
            message: "Token must be provided"
        })
    }
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let date = get_current_date().split(" ")[0]
    let beat_id = req.body.beat_id ? req.body.beat_id : "";
    let route_id = req.body.route_id ? req.body.route_id : "";
    let retailer_id = req.body.retailer_id ? req.body.retailer_id : "";
    let complaint = req.body.complaint ? req.body.complaint : "";
    let suggestion = req.body.suggestion ? req.body.suggestion : "";
    let emp_data = await Employee.findOne({ _id: employee_id });
    let beat_data = await Beat.findOne({ _id: beat_id });
    let route_data = await Route.findOne({ _id: route_id });
    let retailer_data = await Retailer.findOne({ _id: retailer_id });
    let customer_type_data = await CustomerType.findOne({ _id: retailer_data.customer_type });
    let new_feedback = await Feedback.create({
        beat_id: beat_id,
        company_id: emp_data.companyId,
        employee_id: employee_id,
        employee_name: emp_data.employeeName,
        route_id: route_id,
        route_name: route_data.route_name,
        customer_id: retailer_data.customer_type,
        customer_name: customer_type_data.customer_type,
        retailer_id: retailer_id,
        retailer_name: retailer_data.customerName,
        complaint: complaint,
        suggestion: suggestion,
        beat_name: beat_data.beatName,
        date: date,
        Created_date: get_current_date(),
        Updated_date: get_current_date(),
        status: "Active"
    })
    return res.json({ status: true, message: "Feedback submitted", result: new_feedback })
})

module.exports = router;