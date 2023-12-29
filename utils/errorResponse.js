module.exports = function errorHandler(
  res,
  statusCode = 500,
  message = "Internal Server Error!"
) {
  return res.status(statusCode).json({ status: false, message: message });
};
