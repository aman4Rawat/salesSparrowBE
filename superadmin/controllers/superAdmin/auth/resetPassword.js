const bcrypt = require("bcrypt");
const { ApiError } = require("../../../errorHandler/apiErrorHandler");
const verifyJWT = require("../../../utils/verifyJWT");
const SuperAdmin = require("../../../models/superAdminModel");

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        if (!token) throw new ApiError("Token is required!", 400);
        if (!password) throw new ApiError("Password is required!", 400);

        const verifiedUser = verifyJWT(token)
        const salt = await bcrypt.genSalt(10)
        const hashPass = await bcrypt.hash(password, salt);

        const user = await SuperAdmin.findByIdAndUpdate(verifiedUser._id, { password: hashPass }, { new: true });
        res.status(200).json({ status: true, message: "Password reseted successfully.", data: user });
    } catch (error) {
        next(error)
    }
}

module.exports = resetPassword;