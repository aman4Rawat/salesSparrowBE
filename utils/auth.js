const jwt = require("jsonwebtoken");

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
  next();
};
