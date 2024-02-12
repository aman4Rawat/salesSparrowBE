const { ApiError } = require("../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../models/superAdminModel");
const deleteImageHandler = require("../../utils/deleteImageHandler");
const getBaseUrl = require("../../utils/getBaseUrl");
const imageUpload = require("../../utils/imageUpload");

const updateProfile = async (req, res, next) => {
    imageUpload(req, res, async (error) => {
        try {
            if (error) throw new ApiError("Multer error!", 400);

            let { _id, first_name, last_name, phone_number, status, email, permissions, oldPassword, password } = req.body;
            if(!_id) return res.json({status: false, message: "_id is required!"})

            let user = await SuperAdmin.findById(_id);
            let oldImage = user.profile_image || "";

            if (first_name) user.first_name = first_name;
            if (last_name) user.last_name = last_name;
            if (phone_number) user.phone_number = phone_number;
            if (email) user.email = email;
            if (permissions) user.permissions = JSON.parse(permissions);
            if (password) {
                if (user.password !== oldPassword) return res.json({ status: false, message: "Old password is incorrect!" })
                user.password = password;
            }
            // if (String(status)) user.status = status;

            if (req.file) user.profile_image = getBaseUrl() + "images/" + req.file.filename;

            await user.save();
            deleteImageHandler(oldImage);
            res.status(200).json({ status: true, message: "User details updated successfully!", data: user });
        } catch (error) {
            next(error)
        }
    })
}

module.exports = updateProfile;