const mongoose = require('mongoose');
const { isValidObjectId } = require("mongoose");
const { ApiError } = require("../../errorHandler/apiErrorHandler");
const Admin = mongoose.model('AdminInfo');

const deleteCompany = async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) throw new ApiError("ID is required!", 400);
        if (!isValidObjectId(id)) throw new ApiError("Invalid ID!", 400);

        const deletedCompany = await Admin.findByIdAndUpdate(id, { is_delete: "1" }, { new: true });
        if (!deletedCompany) throw new ApiError("No document found with this ID", 404);
        res.status(200).json({ status: true, message: "Company deleted successfully.", data: deletedCompany });
    } catch (error) {
        next(error);
    }
}

module.exports = deleteCompany;