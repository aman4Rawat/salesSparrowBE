const { ApiError } = require("../../errorHandler/apiErrorHandler");
const SuperAdmin = require("../../models/superAdminModel");

const getAllUsers = async (req, res, next) => {
    try {

        let { page, limit } = req.body;
        page = page ? page : 1;
        limit = limit ? limit : 10;

        let findCondition = { role: "user", is_deleted: false, status: true };

        // let allUsersCount = await SuperAdmin.countDocuments(findCondition);
        let allUsers = await SuperAdmin.find(findCondition)
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select("-is_deleted -__v");

        if (allUsers.length === 0) return res.status(200).json({ status: true, message: "No user found!" });
        res.status(200).json({
            status: true,
            message: "All users found successfully.",
            total_count: allUsers.legth,
            total_pages: Math.ceil(allUsers.legth / limit),
            data: allUsers,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = getAllUsers;