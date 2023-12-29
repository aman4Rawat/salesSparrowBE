const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const Attendance = mongoose.model("Attendance");
const Beat = mongoose.model("Beat");
const Party = mongoose.model("Party");
const NightStay = mongoose.model("NightStay");
const PrimaryVisit = mongoose.model("PrimaryVisit");
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink)
const Leave = mongoose.model("Leave");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const sharp = require('sharp');
const path = require('path');
const jwt = require("jsonwebtoken");

// const imageStorage = multer.diskStorage({
//   destination: "images/Employee_image",
//   filename: (req, file, cb) => {
//     // sharp(req.file.path).resize(640,480).toFile(destination)
//     cb(null, file.fieldname + "_" + Date.now());
//   },
// });

// const imageUpload = multer({
//   storage: imageStorage,
// });
const imageStorage2 = multer.diskStorage({
    destination: "images/night_stay",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now());
    },
});

const imageUpload2 = multer({
    storage: imageStorage2,
}).single("night_stay_img");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/Employee_image');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

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
    storage: storage,
}).single("selfie");

router.post('/punchAttendance', async (req, res) => {
    imageUpload(req, res, async (err) => {
        // const imagePath = path.join('image', '..', req.file.path);
        // const newPath = `images/Employee_image/${Date.now()}-${req.file.originalname}`
        // const image = await sharp(imagePath).resize(300).toFile(newPath);
        // await sharp(imagePath).resize(300).toFile(newPath);
        // await unlinkFile(imagePath);
        // console.log("req.body --------------", req.body);
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.json({ status: false, message: "Token must be provided", });
        var decodedToken = jwt.verify(token, "test");
        var employee_id = decodedToken.user_id;

        let empImage;
        if (req.file) empImage = `${base_url}${req.file.path}`;
        else empImage = ""

        var beat = req.body.beat ? req.body.beat : "";
        var party_id_arr = req.body.party_id_arr ? req.body.party_id_arr : '';
        var activity = req.body.activity ? req.body.activity : "";
        var location = req.body.location ? req.body.location : "";
        var lat = req.body.lat ? req.body.lat : "";
        var long = req.body.long ? req.body.long : "";
        let date = get_current_date().split(" ")[0];
        let leave_data = await Leave.findOne({ emp_id: employee_id, date1: date });
        if (leave_data) return res.json({ status: false, message: "You are on leave for today!" })
        // console.log(party_id_arr);
        if (beat != "") {
            if (party_id_arr != null) {
                // console.log("party_id_arr ----------------------------->", party_id_arr)
                // if (activity != "") {
                // if (location != "") {
                let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
                if (attendance_data) return res.json({ status: true, message: "Attendance is already punched" })
                Employee.findOne({ _id: employee_id }).exec().then(emp_data => {
                    if (emp_data.status == "Active" || emp_data.status == "Approved") {
                        var new_attendance = new Attendance({
                            emp_id: employee_id,
                            party_id_arr: party_id_arr,
                            beat_id: beat,
                            date: new Date(),
                            date2: date,
                            activity_id: activity || "",
                            selfie: empImage,
                            location: location,
                            lat: lat,
                            long: long,
                            Created_date: get_current_date(),
                            Updated_date: get_current_date(),
                            status: "Working",
                        });
                        new_attendance.save().then(async (data) => {
                            if (data) {
                                let attendance_data = await Attendance.findOne({ emp_id: employee_id }).sort({ Created_date: -1 })
                                // console.log("--------",attendance_data.party_id_arr[0].split(","));
                                // console.log("beat_data ------------------->")
                                let beat_data = data.beat_id ? await Beat.findOne({ _id: data.beat_id }) : {}
                                let list = [];
                                // console.log("------------",party_id_arr);
                                let x = party_id_arr.split(",")
                                // console.log("xx-----------", x, x.length);
                                for (let i = 0; i < x.length; i++) {
                                    if (x[i] !== "") {
                                        let party_data = await Party.findOne({ _id: x[i] });
                                        list.push(party_data)

                                        let pVisit = await PrimaryVisit.findOne({ emp_id: employee_id, party_id: x[i], date })
                                        if (!pVisit) {
                                            let primary_visit = await PrimaryVisit.create({
                                                emp_id: employee_id,
                                                beat_id: beat,
                                                party_id: x[i] || "",
                                                date: date,
                                                Created_date: get_current_date(),
                                                Updated_date: get_current_date(),
                                                status: "punch"
                                            })
                                        }
                                    }
                                }
                                // console.log(list);
                                let arr = [beat_data, list, attendance_data];
                                return res.json({
                                    status: true,
                                    message: "Attendance marked successfully",
                                    result: arr
                                })
                            }
                        })
                    } else {
                        return res.json({ status: false, message: "You are not active yet", })
                    }
                })
                // } else {
                //     return res.json({ status: false, message: "Location must be selected", })
                // }
                // } else {
                //     return res.json({ status: false, message: "Activity must be selected", })
                // }
            } else {
                return res.json({ status: false, message: "Distributor must be selected", })
            }
        } else {
            return res.json({ status: false, message: "Beat must be selected", })
        }
    });
});

// router.post('/punchAttendance', upload.single('selfie'), async (req, res) => {
//     const imagePath = path.join('image', '..', req.file.path);
//     const newPath = `images/Employee_image/${Date.now()}-${req.file.originalname}`
//     const image = await sharp(imagePath).resize(300).toFile(newPath);
//     await sharp(imagePath).resize(300).toFile(newPath);
//     await unlinkFile(imagePath);
//     // console.log("req.body --------------", req.body);
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.json({ status: false, message: "Token must be provided", });
//     var decodedToken = jwt.verify(token, "test");
//     // console.log("token -------------------------->", token)
//     var employee_id = decodedToken.user_id;
//     var beat = req.body.beat ? req.body.beat : "";
//     var party_id_arr = req.body.party_id_arr ? req.body.party_id_arr : '';
//     var activity = req.body.activity ? req.body.activity : "";
//     var location = req.body.location ? req.body.location : "";
//     var lat = req.body.lat ? req.body.lat : "";
//     var long = req.body.long ? req.body.long : "";
//     let date = get_current_date().split(" ")[0];
//     let leave_data = await Leave.findOne({ emp_id: employee_id, date1: date });
//     if (leave_data) return res.json({ status: false, message: "You are on leave for today!" })
//     // console.log(party_id_arr);
//     if (beat != "") {
//         if (party_id_arr != null) {
//             // console.log("party_id_arr ----------------------------->", party_id_arr)
//             // if (activity != "") {
//                 if (location != "") {
//                     let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
//                     if (attendance_data) return res.json({ status: true, message: "Attendance is already punched" })
//                     Employee.findOne({ _id: employee_id }).exec().then(emp_data => {
//                         if (emp_data.status == "Active" || emp_data.status == "Approved") {
//                             var new_attendance = new Attendance({
//                                 emp_id: employee_id,
//                                 party_id_arr: party_id_arr,
//                                 beat_id: beat,
//                                 date: new Date(),
//                                 date2: date,
//                                 activity_id: activity || "",
//                                 selfie: `${base_url}${newPath}`,
//                                 location: location,
//                                 lat: lat,
//                                 long: long,
//                                 Created_date: get_current_date(),
//                                 Updated_date: get_current_date(),
//                                 status: "Working",
//                             });
//                             new_attendance.save().then(async (data) => {
//                                 if (data) {
//                                     let attendance_data = await Attendance.findOne({ emp_id: employee_id }).sort({ Created_date: -1 })
//                                     // console.log("--------",attendance_data.party_id_arr[0].split(","));
//                                     // console.log("beat_data ------------------->")
//                                     let beat_data = data.beat_id ? await Beat.findOne({ _id: data.beat_id }) : {}
//                                     let list = [];
//                                     // console.log("------------",party_id_arr);
//                                     let x = party_id_arr.split(",")
//                                     // console.log("xx-----------", x, x.length);
//                                     for (let i = 0; i < x.length; i++) {
//                                         if (x[i] !== "") {
//                                             let party_data = await Party.findOne({ _id: x[i] });
//                                             list.push(party_data)

//                                             let pVisit = await PrimaryVisit.findOne({ emp_id: employee_id, party_id: x[i], date })
//                                             if (!pVisit) {
//                                                 let primary_visit = await PrimaryVisit.create({
//                                                     emp_id: employee_id,
//                                                     beat_id: beat,
//                                                     party_id: x[i] || "",
//                                                     date: date,
//                                                     Created_date: get_current_date(),
//                                                     Updated_date: get_current_date(),
//                                                     status: "punch"
//                                                 })
//                                             }
//                                         }
//                                     }
//                                     // console.log(list);
//                                     let arr = [beat_data, list, attendance_data];
//                                     return res.json({
//                                         status: true,
//                                         message: "Attendance marked successfully",
//                                         result: arr
//                                     })
//                                 }
//                             })
//                         } else {
//                             return res.json({ status: false, message: "You are not active yet", })
//                         }
//                     })
//                 } else {
//                     return res.json({ status: false, message: "Location must be selected", })
//                 }
//             // } else {
//             //     return res.json({ status: false, message: "Activity must be selected", })
//             // }
//         } else {
//             return res.json({ status: false, message: "Distributor must be selected", })
//         }
//     } else {
//         return res.json({ status: false, message: "Beat must be selected", })
//     }
// });

router.post('/attendanceListOfEmployee', async (req, res) => {
    let employee_id = req.body.employee_id ? req.body.employee_id : "";
    let page = req.body.page ? req.body.page : "1";
    if (employee_id == "") return res.json({ status: false, message: "Please provide the Employee" });
    let count = await Attendance.find({ emp_id: employee_id });
    let limit = 10;
    let attendance_data = await Attendance.find({ emp_id: employee_id }).limit(limit * 1).skip((page - 1) * limit);
    if (attendance_data.length < 1) return res.json({ status: true, message: "No Data", result: [] });
    let counInfo = 0
    for (let i = 0; i < attendance_data.length; i++) {
        let list = [];
        await (async function (rowData) {
            var beat_data = await Beat.findOne({ _id: attendance_data[i].beat_id, });
            var party_data = await Party.findOne({ _id: attendance_data[i].party_id, });
            var employee_data = await Employee.findOne({ _id: attendance_data[i].emp_id, });
            var u_data = {
                id: rowData._id,
                party: { name: party_data?.firmName || "NA", id: party_data._id || "" },
                beat: { name: beat_data?.beatName || "NA", id: beat_data?._id || "" },
                employee: { name: employee_data.employeeName, id: employee_data._id },
                activity: rowData.activity,
                date: rowData.date,
                selfie: rowData.selfie,
                location: rowData.location,
                status: rowData.status
            };
            list.push(u_data);
        })(attendance_data[i]);
        counInfo++;
        if (counInfo == attendance_data.length) {
            let c = Math.ceil(count.length / limit);
            console.log(count.length);
            console.log(c);
            if (c == 0) {
                c += 1;
            }
            res.json({
                status: true,
                message: "Parties for this state found successfully",
                result: list,
                pageLength: c,
            });
        }
    }
})

router.get('/get_todays_attendance_data', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let date = get_current_date().split(" ")[0];
    let attendance_data = await Attendance.findOne({ $and: [{ emp_id: employee_id }, { date2: date }] });
    if (!attendance_data) return res.json({ status: true, message: "Please punch attendance first", result: [] })
    let beat_data = await Beat.findOne({ _id: attendance_data.beat_id });
    let party_data = await Party.findOne({ _id: attendance_data.party_id });
    let arr = [beat_data, party_data];
    return res.json({ status: true, message: "Attendance marked successfully", result: arr })
})

router.post('/night_stay', (req, res) => {
    imageUpload2(req, res, async (err) => {
        console.log("file", req.file);
        console.log("body", req.body);
        if (!req.file) return res.status(201).json({ status: true, message: "File not found" });
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.json({ status: false, message: "Token must be provided", });
        var decodedToken = jwt.verify(token, "test");
        var employee_id = decodedToken.user_id;
        let date = get_current_date().split(" ")[0];
        var hotel_name = req.body.hotel_name ? req.body.hotel_name : "";
        var address = req.body.address ? req.body.address : "";
        var location = req.body.location ? req.body.location : "";
        let emp_data = await Employee.findOne({ _id: employee_id })
        let new_nightstay = await NightStay.create({
            emp_id: employee_id,
            company_id: emp_data.companyId,
            emp_name: emp_data.employeeName,
            hotel_name: hotel_name,
            date: date,
            date2: new Date(),
            address: address,
            location: location,
            selfie: `${base_url}${req.file.path}`,
            status: "Active",
            Created_date: get_current_date(),
            Updated_date: get_current_date(),
        })
        return res.json({ status: true, message: "Submitted", result: new_nightstay })
    })
})

router.post('/leave', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token must be provided", });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({ _id: employee_id })
    let type = req.body.type ? req.body.type : "";
    let date = get_current_date().split(" ")[0];
    if (type == "") return res.json({ status: false, message: "Please provide leave type" })
    let att_data = await Attendance.findOne({ emp_id: employee_id, date: date });
    if (att_data) return res.json({ status: false, message: "You punched attendance for today!" })
    if (type == "Short") {
        let date1 = req.body.date1 ? req.body.date1 : "";
        let reason = req.body.reason ? req.body.reason : "";
        let specific_reason = req.body.specific_reason ? req.body.specific_reason : "";
        if (date1 == "") return res.json({ status: false, message: "Please provide date of leave" })
        if (reason == "") return res.json({ status: false, message: "Please provide reason" })
        if (specific_reason == "") return res.json({ status: false, message: "Please provide specific reason" })
        let att_data = await Attendance.findOne({ emp_id: employee_id, date2: date1 });
        if (att_data) return res.json({ status: false, message: "You have punched attendance for this date" })
        let old_leave_data = await Leave.findOne({ emp_id: employee_id, date1: date1 })
        if (old_leave_data) return res.json({ status: false, message: "Leave already applied for this date" })
        let new_leave = await Leave.create({
            emp_id: employee_id,
            company_id: emp_data.companyId,
            type: type,
            reason: reason,
            specific_reason: specific_reason,
            emp_name: emp_data.employeeName,
            date1: date1,
            date: date,
            status: "Active",
            Created_date: get_current_date(),
            Updated_date: get_current_date(),
        })
        return res.json({ status: true, message: "Leave applied successfully", result: new_leave })
    } else if (type == "Long") {
        let date1 = req.body.date1 ? req.body.date1 : "";
        let date2 = req.body.date2 ? req.body.date2 : "";
        let reason = req.body.reason ? req.body.reason : "";
        let specific_reason = req.body.specific_reason ? req.body.specific_reason : "";
        if (date1 == "") return res.json({ status: false, message: "Please provide date of leave" })
        if (reason == "") return res.json({ status: false, message: "Please provide reason" })
        if (specific_reason == "") return res.json({ status: false, message: "Please provide specific reason" })
        let new_leave = await Leave.create({
            emp_id: employee_id,
            company_id: emp_data.companyId,
            type: type,
            reason: reason,
            specific_reason: specific_reason,
            emp_name: emp_data.employeeName,
            date1: date1,
            date2: date2,
            date: date,
            status: "Active",
            Created_date: get_current_date(),
            Updated_date: get_current_date(),
        })
        return res.json({ status: true, message: "Leave applied successfully", result: new_leave })
    } else {
        return res.json({ status: false, message: "Please check type" })
    }
})

router.get('/check_attendance', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token must be provided", });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let date = get_current_date().split(" ")[0];
    let attendance_data = await Attendance.findOne({ emp_id: employee_id, date2: date })
    if (!attendance_data) return res.json({ status: false, message: "Please punch attendance for today" })
    if (attendance_data) return res.json({ status: true, message: "Attendance is already punched" })
})

router.get('/check_leave', async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token must be provided", });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let date = get_current_date().split(" ")[0];
    let leave_data = await Leave.find({ emp_id: employee_id });
    if (leave_data.length > 0) {
        console.log('Found leave data');
        for (let i = 0; i < leave_data.length; i++) {
            console.log('inside for loop--');
            if (leave_data[i].type == 'Short') {
                console.log('Short');
                if (date == leave_data[i].date1) {
                    return res.json({ status: true, message: "You are on leave today" })
                }
            } else if (leave_data[i].type == 'Long') {
                console.log('Short');
                const targetDate = new Date(date);
                const startDate = new Date(leave_data[i].date1);
                const endDate = new Date(leave_data[i].date2);
                if (targetDate >= startDate && targetDate <= endDate) {
                    return res.json({ status: true, message: "You are on leave today" })
                }
            } else {
                console.log('No type');
                return res.json({ status: false })
            }
        }
    } else {
        console.log('No leave data');
        return res.json({ status: false })
    }
    return res.json({ status: false })
})

module.exports = router;