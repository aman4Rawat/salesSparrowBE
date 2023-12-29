const SuperAdmin = require("../../../models/superAdminModel");
const { ApiError } = require("../../../errorHandler/apiErrorHandler")

const signupSuperAdmin = async (req, res, next) => {
    try {
        const { email, password, role, permissions, first_name, last_name, phone_number } = req.body;

        const existingUser = await SuperAdmin.findOne({ email });
        if (existingUser) throw new ApiError("User already exist!", 400);
       
        const newUser = await SuperAdmin.create({ email, password, role, permissions, first_name, last_name, phone_number })
        res.status(201).json({ status: true, message: "User signup successfully.", data: newUser });
    } catch (error) {
        next(error)
    }
}

module.exports = signupSuperAdmin;