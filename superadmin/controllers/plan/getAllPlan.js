const Plan = require("../../models/planModel");

const getAllPlan = async (req, res, next) => {
    try {
        let { page, limit } = req.body;
        page = page ? page : 1;
        limit = limit ? limit : 10;

        let findCondition = { is_deleted: false, status: true };

        // let planCount = await Plan.countDocuments(findCondition);
        let allPlan = await Plan.find(findCondition)
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        if (allPlan.length === 0) return res.status(200).json({ status: true, message: "no plan found", data: [] });
        res.status(200).json({
            status: true,
            message: "All plan fetched successfully!",
            total_users: allPlan.length,
            total_pages: Math.ceil(allPlan.length / limit),
            data: allPlan,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = getAllPlan;