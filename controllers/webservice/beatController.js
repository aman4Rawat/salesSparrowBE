const express = require("express");
const mongoose = require("mongoose");
const Beat = mongoose.model("Beat");
const Employee = mongoose.model("Employee");
const Location = mongoose.model("Location");
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
}

router.post("/addBeat", (req, res) => {
  console.log(req.body);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  var beatName = req.body.beatName ? req.body.beatName : "";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var employee_id = req.body.employee_id ? req.body.employee_id : "";
  var day = req.body.day ? req.body.day : "";
  var route = req.body.route ? req.body.route : null;
  if (state != "") {
    if (city != "") {
      if (beatName != "") {
        if (employee_id != "") {
          if (day != "") {
            if (route != "") {
              Beat.find({ $and: [{ company_id }, { beatName: beatName }] })
                .exec()
                .then((beat_info) => {
                  if (beat_info.length < 1) {
                    var new_beat = new Beat({
                      beatName: beatName,
                      employee_id: employee_id,
                      day: day,
                      state: state,
                      city: city,
                      company_id: company_id,
                      route: route,
                      Created_date: get_current_date(),
                      Updated_date: get_current_date(),
                      status: "Active",
                    });
                    new_beat.save().then((data) => {
                      res.status(200).json({
                        status: true,
                        message: "New Beat is created successfully",
                        result: data,
                      });
                    });
                  } else {
                    res.json({
                      status: true,
                      message: "Beat already exists",
                      result: null,
                    });
                  }
                });
            } else {
              return res.json({
                status: false,
                message: "Route id is required",
                result: null,
              });
            }
          } else {
            return res.json({
              status: false,
              message: "Day is required",
              result: null,
            });
          }
        } else {
          return res.json({
            status: false,
            message: "Employee id is required",
            result: null,
          });
        }
      } else {
        return res.json({
          status: false,
          message: "Beat Name is required",
          result: null,
        });
      }
    } else {
      return res.json({
        status: false,
        message: "City is required",
        result: null,
      });
    }
  } else {
    return res.json({
      status: false,
      message: "State is required",
      result: null,
    });
  }
});

router.post("/editBeat", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    Beat.find({ _id: id })
      .exec()
      .then((beat_data) => {
        if (beat_data.length > 0) {
          var updated_beat = {};
          if (req.body.beatName) {
            updated_beat.beatName = req.body.beatName;
          }
          if (req.body.employee_id) {
            updated_beat.employee_id = req.body.employee_id;
          }
          if (req.body.day) {
            updated_beat.day = req.body.day;
          }
          if (req.body.route) {
            updated_beat.route = req.body.route;
          }
          if (req.body.status) {
            updated_beat.status = req.body.status;
          }
          updated_beat.Updated_date = get_current_date();
          Beat.findOneAndUpdate(
            { _id: id },
            updated_beat,
            { new: true },
            (err, doc) => {
              if (doc) {
                res.status(200).json({
                  status: true,
                  message: "Update successfully",
                  result: updated_beat,
                });
              }
            }
          );
        } else {
          res.json({
            status: false,
            message: "Beat not found.",
            result: null,
          });
        }
      });
  } else {
    return res.json({
      status: false,
      message: "Id is required",
      result: null,
    });
  }
});

router.post("/getAllBeat", async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  var page = req.body.page ? req.body.page : "1";
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var search = req.body.search ? req.body.search : "";
  var limit = req.body.limit ? req.body.limit : 10;
  var list = [];
  var decodedToken = jwt.verify(token, "test");
  var company_id = decodedToken.user_id;
  let obj = { company_id }
  if (state != "") obj.state = state;
  if (city != "") obj.city = city;
  if (search != "") {
    var regex = new RegExp(search, 'i');
    obj.beatName = regex;
  }
  var count = await Beat.find(obj);
  Beat.find(obj)
    .sort({ status: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ Created_date: -1 })
    .exec()
    .then(async (beat_data) => {
      console.log(beat_data);
      let counInfo = 0;
      if (beat_data.length > 0) {
        for (let i = 0; i < beat_data.length; i++) {
          await (async function (rowData) {
            var emp_data = await Employee.findOne({ _id: beat_data[i].employee_id });
            let list2 = beat_data[i].route
            let arr = [];
            for (let x = 0; x < list2.length; x++) {
              var route_data = await Route.findOne({ _id: list2[x] });
              let u_data = {
                id: route_data._id,
                route_name: route_data.route_name,
              }
              arr.push(u_data);
            }
            console.log(arr);
            var state_data = await Location.findOne({ id: beat_data[i].state });
            var city_data = await Location.findOne({ id: beat_data[i].city });
            var u_data = {
              id: rowData._id,
              state: {
                name: state_data.name,
                id: beat_data[i].state,
              },
              city: {
                name: city_data.name,
                id: beat_data[i].city,
              },
              employee_name: emp_data ? emp_data.employeeName : '',
              route: arr,
              beatName: rowData.beatName,
              day: rowData.day,
              status: rowData.status,
            };
            list.push(u_data);
          })(beat_data[i]);
          counInfo++;
          if (counInfo == beat_data.length) {
            let c = Math.ceil(count.length / limit);
            if (c == 0) {
              c += 1;
            }
            res.json({
              status: true,
              message: "All Beats found successfully",
              result: list,
              pageLength: c,
              count: count.length
            });
          }
        }
      } else {
        return res.json({
          status: true,
          message: "Beat not found",
          result: [],
        });
      }
    });
});

router.post("/getBeat", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  Beat.findOne({ _id: id }).exec().then(async (beat_data) => {
    if (beat_data) {
      let state_data = await Location.findOne({ id: beat_data.state })
      let city_data = await Location.findOne({ id: beat_data.city })
      let emp_data = await Employee.findOne({ _id: beat_data.employee_id })
      let list2 = beat_data.route
      let arr = [];
      for (let x = 0; x < list2.length; x++) {
        var route_data = await Route.findOne({ _id: list2[x] });
        let u_data = {
          id: route_data._id,
          route_name: route_data.route_name,
        }
        arr.push(u_data);
      }
      var u_data = {
        id: beat_data._id,
        state: { name: state_data.name, id: beat_data.state },
        city: { name: city_data.name, id: beat_data.city },
        employee_name: emp_data.employeeName,
        route: arr,
        day: beat_data.day,
        beatName: beat_data.beatName,
      };
      res.json({
        status: true,
        message: "data fetched",
        result: [u_data],
      });
    } else {
      res.json({
        status: false,
        message: "Beat not found",
        result: [],
      });
    }
  });
});

router.delete("/deleteBeat", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    Beat.findOneAndDelete({ _id: id })
      .exec()
      .then((doc) => {
        res.status(200).json({
          status: true,
          message: "Deleted successfully",
        });
      });
  }
});
module.exports = router;
