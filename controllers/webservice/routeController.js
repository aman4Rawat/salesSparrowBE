const express = require("express");
const mongoose = require("mongoose");
const Route = mongoose.model("Route");
const Location = mongoose.model("Location");
const Party = mongoose.model("Party");
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

router.post("/addRoute", (req, res) => {
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
  var state = req.body.state ? req.body.state : "";
  var distance = req.body.distance ? req.body.distance : "";
  var city = req.body.city ? req.body.city : "";
  var route_name = req.body.route_name ? req.body.route_name : "";
  var start_point = req.body.start_point ? req.body.start_point : "";
  var end_point = req.body.end_point ? req.body.end_point : "";
  if (authHeader != "") {
    if (state != "") {
      if (city != "") {
              var new_route = new Route({
                state: state,
                city: city,
                route_name: route_name,
                distance: distance,
                start_point: start_point,
                company_id: company_id,
                end_point: end_point,
                Created_date: get_current_date(),
                Updated_date: get_current_date(),
                status: "Active",
              });
              new_route.save().then((data) => {
                res.json({
                  status: true,
                  message: "Route created successfully",
                  result: data,
                });
              });
      } else {
        res.json({
          status: false,
          message: "City is required.",
        });
      }
    } else {
      res.json({
        status: false,
        message: "State is required.",
      });
    }
  } else {
    res.json({
      status: false,
      message: "Token is required.",
    });
  }
});

// router.post("/routeListing", async (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   var decodedToken = jwt.verify(token, "test");
//   var company_id = decodedToken.user_id;
//   var state = req.body.state ? req.body.state : "";
//   var city = req.body.city ? req.body.city : "";
//   // var area = req.body.area ? req.body.area : "";
//   var count = await Route.find({ company_id });
//   var limit = 10;
//   if (state != "" && city =="") {
//         var list = [];
//         Route.find({ $and: [{ company_id }, { state }] })
//           .exec()
//           .then((route_data) => {
//             if(route_data.length>0){
//               let counInfo = 0;
//             for (let i = 0; i < route_data.length; i++) {
//               Location.findOne({ _id: route_data[i].state })
//                 .exec()
//                 .then((state_data) => {
//                   Location.findOne({ _id: route_data[i].city })
//                     .exec()
//                     .then((city_data) => {
//                       Location.findOne({ _id: route_data[i].area })
//                         .exec()
//                         .then(async (area_data) => {
//                           await (async function (rowData) {
//                             var u_data = {
//                               id: rowData._id,
//                               state:{name:state_data.name,id:rowData.state},
//                               city:{name:city_data.name,id:rowData.city},
//                               area:{name:area_data.name,id:rowData.area},
//                               start_point: rowData.start_point,
//                               distance: rowData.distance,
//                               end_point: rowData.end_point,
//                             };
//                             list.push(u_data);
//                           })(route_data[i]);
//                           counInfo++;
//                           if (counInfo == route_data.length) {
//                             res.json({
//                               status: true,
//                               message: "All Routes found successfully",
//                               result: list,
//                               pageLength: Math.ceil(count.length / limit),
//                             });
//                           }
//                         });
//                     });
//                 });
//             }
//             }else{
//               res.json({
//                 status:false,
//                 message:"No route found for this state",
//                 result:[]
//               })
//             }
//           });
//   } else if(state!="" && city!=""){
//     var list = [];
//         Route.find({ $and: [{ company_id }, { state } , {city}] }).exec().then((route_data) => {
//             if(route_data.length>0){
//               let counInfo = 0;
//             for (let i = 0; i < route_data.length; i++) {
//               Location.findOne({ _id: route_data[i].state })
//                 .exec()
//                 .then((state_data) => {
//                   Location.findOne({ _id: route_data[i].city })
//                     .exec()
//                     .then((city_data) => {
//                       Location.findOne({ _id: route_data[i].area })
//                         .exec()
//                         .then(async (area_data) => {
//                           await (async function (rowData) {
//                             var u_data = {
//                               id: rowData._id,
//                               state:{name:state_data.name,id:rowData.state},
//                               city:{name:city_data.name,id:rowData.city},
//                               area:{name:area_data.name,id:rowData.area},
//                               start_point: rowData.start_point,
//                               distance: rowData.distance,
//                               end_point: rowData.end_point,
//                             };
//                             list.push(u_data);
//                           })(route_data[i]);
//                           counInfo++;
//                           if (counInfo == route_data.length) {
//                             res.json({
//                               status: true,
//                               message: "All Routes found successfully",
//                               result: list,
//                               pageLength: Math.ceil(count.length / limit),
//                             });
//                           }
//                         });
//                     });
//                 });
//             }
//             }else{
//               res.json({
//                 status:false,
//                 message:"No route found for this state",
//                 result:[]
//               })
//             }
//           });
//   }else {
//     var list = [];
//     Route.find({ company_id })
//       .exec()
//       .then((route_data) => {
//         if(route_data.length>0){
//           let counInfo = 0;
//         for (let i = 0; i < route_data.length; i++) {
//           Location.findOne({ _id: route_data[i].state })
//             .exec()
//             .then((state_data) => {
//               Location.findOne({ _id: route_data[i].city })
//                 .exec()
//                 .then((city_data) => {
//                   Location.findOne({ _id: route_data[i].area })
//                     .exec()
//                     .then(async (area_data) => {
//                       await (async function (rowData) {
//                         var u_data = {
//                           id: rowData._id,
//                           state:{name:state_data.name,id:rowData.state},
//                           city:{name:city_data.name,id:rowData.city},
//                           area:{name:area_data.name,id:rowData.area},
//                           start_point: rowData.start_point,
//                           distance: rowData.distance,
//                           end_point: rowData.end_point,
//                         };
//                         list.push(u_data);
//                       })(route_data[i]);
//                       counInfo++;
//                       if (counInfo == route_data.length) {
//                         res.json({
//                           status: true,
//                           message: "All Routes found successfully",
//                           result: list,
//                           pageLength: Math.ceil(count.length / limit),
//                         });
//                       }
//                     });
//                 });
//             });
//         }
//         }else{
//           res.json({
//             status:false,
//             message:"No route found ",
//             result:[]
//           })
//         }
//       });
//   }
// });

router.post("/routeListing", async (req, res) => {
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
  var state = req.body.state ? req.body.state : "";
  var search = req.body.search ? req.body.search : "";
  var city = req.body.city ? req.body.city : "";
  var limit = req.body.limit ? req.body.limit : 10;
  let arr = [];
  if (company_id != "" && state == "" && city == "") {
    arr = [{ company_id }];
  } else if (company_id != "" && state != "" && city == "") {
    arr = [{ company_id }, { state }];
  } else if (company_id != "" && state != "" && city != "") {
    arr = [{ company_id }, { state }, { city }];
  }
  if (search != "") {
    var regex = new RegExp(search, 'i');
    arr.push({route_name:regex});
  }
  console.log(arr);
  var count = await Route.find({ $and:arr });
  var list = [];
        Route.find({$and:arr}).exec().then(async (route_data) => {
            if(route_data.length>0){
              let counInfo = 0;
              let party_data = await Party.find({company_id,is_delete:"0"})
              console.log(party_data);
              for (let i = 0; i < route_data.length; i++) {
                Location.findOne({ id: route_data[i].state }).exec().then((state_data) => {
                  Location.findOne({ id: route_data[i].city }).exec().then(async (city_data) => {
                    let final_arr = [];
                      for (let j = 0; j < party_data.length; j++) {
                        if (party_data[j].route == null) {
                          continue;
                        } else {
                          var arr = party_data[j].route[0] ? party_data[j].route[0].split(",") : "";
                          if (arr == "") {
                          } else {
                            console.log(arr.length);
                            for (let k = 0; k < arr.length; k++) {
                              if (arr[k] == route_data[i]._id) {
                                final_arr.push(party_data[j].firmName)
                              }
                            }
                          }
                        }
                      }
                      console.log(final_arr);
                    await (async function (rowData) {
                      var u_data = {
                        id: rowData._id,
                        state: { name: state_data.name, id: rowData.state },
                        city: { name: city_data.name, id: rowData.city },
                        route_name: rowData.route_name,
                        start_point: rowData.start_point,
                        distance: rowData.distance,
                        end_point: rowData.end_point,
                        parties:final_arr,
                        status: rowData.status,
                      };
                      list.push(u_data);
                    })(route_data[i]);
                    counInfo++;
                    if (counInfo == route_data.length) {
                      res.json({
                        status: true,
                        message: "All Routes found successfully",
                        result: list,
                        pageLength: Math.ceil(count.length / limit),
                        count:count.length
                      });
                    }
                  });
                  // });
                });
              }
            }else{
              res.json({
                status:true,
                message:"No route found  ",
                result:[]
              })
            }
          });
});

router.post("/unmapped_routeListing", async (req, res) => {
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
  var state = req.body.state ? req.body.state : "";
  var city = req.body.city ? req.body.city : "";
  var limit = req.body.limit ? req.body.limit : 10;
  let arr = [];
  if (company_id != "" && state == "" && city == "") {
    arr.push({ company_id });
  } else if (company_id != "" && state != "" && city == "") {
    arr.push({ company_id }, { state });
  } else if (company_id != "" && state != "" && city != "") {
    arr.push({ company_id }, { state }, { city });
  }
  arr.push({ is_mapped: false })
  var list = [];
  Route.find({ $and: arr }).exec().then(async (route_data) => {
    if (route_data.length > 0) {
      let counInfo = 0;
      for (let i = 0; i < route_data.length; i++) {
      await (async function (rowData) {
        var u_data = {
          id: rowData._id,
          route_name: rowData.route_name,
        };
        list.push(u_data);
      })(route_data[i]);
      counInfo++;
      if (counInfo == route_data.length) {
        res.json({
          status: true,
          message: "All Routes found successfully",
          result: list,
        });
      }
    }
    } else {
      res.json({
        status: true,
        message: "No route found  ",
        result: []
      })
    }
  });
});

// router.post("/notAssignedRouteListing", async (req, res) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) {
//     return res.json({
//       status: false,
//       message: "Token must be provided",
//     });
//   }
//   var state = req.body.state ? req.body.state : "";
//   var city = req.body.city ? req.body.city : "";
//   var decodedToken = jwt.verify(token, "test");
//   var company_id = decodedToken.user_id;
//   var list = [];
//   let arr = [];
//   if (company_id != "" && state == "" && city == "") {
//     arr = [{ company_id },{is_assigned:"0"}];
//   } else if (company_id != "" && state != "" && city == "") {
//     arr = [{ company_id }, { state },{is_assigned:"0"}];
//   } else if (company_id != "" && state != "" && city != "") {
//     arr = [{ company_id }, { state }, { city },{is_assigned:"0"}];
//   }
//         Route.find({ $and:arr }).exec().then((route_data) => {
//             if(route_data.length>0){
//               let counInfo = 0;
//             for (let i = 0; i < route_data.length; i++) {
//                 Location.findOne({ _id: route_data[i].state }).exec().then((state_data) => {
//                   Location.findOne({ _id: route_data[i].city }).exec().then((city_data) => {
//                       Location.findOne({ _id: route_data[i].area }).exec().then(async (area_data) => {
//                           await (async function (rowData) {
//                             var u_data = {
//                               id: rowData._id,
//                               state:{name:state_data.name,id:rowData.state},
//                               city:{name:city_data.name,id:rowData.city},
//                               area:{name:area_data.name,id:rowData.area},
//                               start_point: rowData.start_point,
//                               distance: rowData.distance,
//                               end_point: rowData.end_point,
//                               status: rowData.status,
//                             };
//                             list.push(u_data);
//                           })(route_data[i]);
//                           counInfo++;
//                           if (counInfo == route_data.length) {
//                             res.json({
//                               status: true,
//                               message: "All Routes found successfully",
//                               result: list,
//                             });
//                           }
//                         });
//                     });
//                 });
//             }
//             }else{
//               res.json({
//                 status:true,
//                 message:"No route found ",
//                 result:[]
//               })
//             }
//           });
// });

router.post("/edit_route", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  if (id != "") {
    var updated_route = {};
    if (req.body.state) {
      updated_route.state = req.body.state;
    }
    if (req.body.city) {
      updated_route.city = req.body.city;
    }
    if (req.body.route_name) {
      updated_route.route_name = req.body.route_name;
    }
    if (req.body.distance) {
      updated_route.distance = req.body.distance;
    }
    if (req.body.start_point) {
      updated_route.start_point = req.body.start_point;
    }
    if (req.body.end_point) {
      updated_route.end_point = req.body.end_point;
    }
    if (req.body.status) {
      updated_route.status = req.body.status;
    }
    Route.findOneAndUpdate({_id:id},updated_route,{new:true},(err,doc)=>{
        if(doc){
            res.json({
                status:true,
                message:"Route updated successfully",
                result:updated_route
            })
        }else{
            res.json({
                status:false,
                message:"Error",
                result:err
            })
        }
    })
  } else {
    res.json({
      status: false,
      message: "Id is required.",
    });
  }
});

router.delete("/deleteRoute", (req, res) => {
  var id = req.body.id ? req.body.id : "";
  Route.deleteOne({ _id: id })
    .exec()
    .then(() => {
      res.json({
        status: true,
        message: "Deleted successfully",
      });
    });
});

module.exports = router;
