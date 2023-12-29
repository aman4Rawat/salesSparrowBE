const jwt = require("jsonwebtoken");

const signJWT = (_id, duration) => {
    try {
        if (duration) return jwt.sign({ _id }, "superadminpanel", { expiresIn: duration });
        return jwt.sign({ _id }, "superadminpanel");
    } catch (error) {
        console.log(error);
    }
}

module.exports = signJWT;