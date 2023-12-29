const { ApiError } = require("../../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../../models/superAdminModel");
const signJWT = require("../../../utils/signJWT");

const forgetPassword = async (req, res, next) => {
    try {
        let { email } = req.body;
        if (!email) throw new ApiError("Email is required!", 400);

        let user = await SuperAdmin.findOne({ email });
        if (!user) throw new ApiError("This user dose not exist!", 404);

        let token = signJWT(user._id, 60 * 10);
        res.status(200).json({ status: true, message: "Please check your mail.", data: { token } });
    } catch (error) {
        next(error);
    }
}

module.exports = forgetPassword;