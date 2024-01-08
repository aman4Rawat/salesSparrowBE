const { ApiError } = require("../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../models/superAdminModel");
const getBaseUrl = require("../../utils/getBaseUrl");
const imageUpload = require("../../utils/imageUpload");

const createUser = async (req, res, next) => {
    imageUpload(req, res, async (error) => {
        try {
            if (error) throw new ApiError("Multer error!", 400);

            let { first_name, last_name, phone_number, email, password, permissions } = req.body;

            const existingUser = await SuperAdmin.findOne({ email });
            if (existingUser) throw new ApiError("User already exist!", 400);

            let profile_image;
            if (req.file) profile_image = getBaseUrl() + "images/" + req.file.filename;

            const newUser = await SuperAdmin.create({
                first_name, last_name, phone_number, email, password,
                profile_image,
                role: "user",
                status: true,
                permissions: JSON.parse(permissions)
            })
            res.status(200).json({ status: true, message: "User created successfully!", data: newUser });
        } catch (error) {
            next(error)
        }
    })
}

module.exports = createUser;