const { isValidObjectId } = require("mongoose");
const { ApiError } = require("../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../models/superAdminModel");

const deleteSuperAdmin = async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) throw new ApiError("ID is required!", 400);
        if (!isValidObjectId(id)) throw new ApiError("Invalid ID!", 400);

        const deletedUser = await SuperAdmin.findByIdAndUpdate(id, { is_delete: true }, { new: true });
        if (!deletedUser) throw new ApiError("No document found with this ID", 404);
        res.status(200).json({ status: true, message: "User deleted successfully.", data: deletedUser });
    } catch (error) {
        next(error);
    }
}

module.exports = deleteSuperAdmin;