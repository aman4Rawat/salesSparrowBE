const { ApiError } = require("../../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../../models/superAdminModel");
const bcrypt = require("bcrypt");
const signJWT = require("../../../utils/signJWT");

const loginSuperAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) throw new ApiError("Email is required!", 400);
        if (!password) throw new ApiError("Password is required!", 400);

        const user = await SuperAdmin.findOne({ email });
        if (!user) throw new ApiError("User does not exist!", 404);

        // const passMatched = await bcrypt.compare(password, user.password);
        if (password != user.password || email !== user.email) throw new ApiError("Invalid credentails!", 404);

        const token = signJWT(user._id);
        user.password = undefined;
        res.status(200).json({ status: true, message: "Login successful.", data: { user, token } });
    } catch (error) {
        next(error)
    }
}

module.exports = loginSuperAdmin;