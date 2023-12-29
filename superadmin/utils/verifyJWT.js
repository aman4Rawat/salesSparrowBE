const jwt = require("jsonwebtoken");
const { ApiError } = require("../errorHandler/apiErrorHandler");

const verifyJWT = (token) => {
    try {
        return jwt.verify(token, "superadminpanel");
    } catch (error) {
        throw new ApiError("Access token invalid!", 401);
    }
}

module.exports = verifyJWT;