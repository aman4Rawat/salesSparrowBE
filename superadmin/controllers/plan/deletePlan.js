const { isValidObjectId } = require("mongoose");
const { ApiError } = require("../../errorHandler/apiErrorHandler");
const Plan = require("../../models/planModel");

const deleteSuperAdmin = async (req, res, next) => {
    try {
        let { id } = req.params;
        if (!id) throw new ApiError("ID is required!", 400);
        if (!isValidObjectId(id)) throw new ApiError("Invalid ID!", 400);

        const deletedPlan = await Plan.findByIdAndDelete(id);
        if (!deletedPlan) throw new ApiError("No document found with this ID", 404);
        res.status(200).json({ status: true, message: "Plan deleted successfully.", data: deletedPlan });
    } catch (error) {
        next(error);
    }
}

module.exports = deleteSuperAdmin;