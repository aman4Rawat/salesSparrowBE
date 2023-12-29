const jwt = require("jsonwebtoken");

const extractCompanyId = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Please provide a token",
    });
  }
  try {
    const decodedToken = jwt.verify(token, "test");
    req.company_id = decodedToken.user_id;
    next();
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Invalid token",
    });
  }
};
const extractEmployeeId = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.json({
      status: false,
      message: "Please provide a token",
    });
  }
  try {
    const decodedToken = jwt.verify(token, "test");
    req.employee_id = decodedToken.user_id;
    next();
  } catch (error) {
    console.log(error);
    res.json({
      status: false,
      message: "Invalid token",
    });
  }
};

module.exports = {extractCompanyId,extractEmployeeId};
