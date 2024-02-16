const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Admin = mongoose.model("AdminInfo");
const Employee = mongoose.model("Employee");

module.exports = async function protectTo(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Token must be provided",
    });
  }
  req.loggedInUser = await jwt.verify(token, "test");
  // if(req.originalUrl.startsWith("/app_api")){
    
  // }
  // console.log("loggedInUser", req.loggedInUser, req.originalUrl.startsWith("/app_api") );
  next();
};
