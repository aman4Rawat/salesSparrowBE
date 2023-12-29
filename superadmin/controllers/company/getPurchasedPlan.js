const mongoose = require('mongoose');
const Admin = mongoose.model('AdminInfo');
const Location = mongoose.model('Location');
const PurchasedPlan = mongoose.model('PurchasedPlan');

const getPurchasedPlan = async (req, res, next) => {
    try {
        let { page, limit, id, type } = req.body;
        page = page ? page : 1;
        limit = limit ? Number(limit) : 10;

        // let planCount = await PurchasedPlan.countDocuments({ companyID: id, "plan.plan_name": type });
        let allPlan = await PurchasedPlan.find({ companyID: id, "plan.plan_name": type })
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        if (allPlan.length === 0) return res.status(200).json({ status: true, message: "no plan found", data: [] });
        res.status(200).json({
            status: true,
            message: "All plans fetched successfully!",
            total_users: allPlan.length,
            total_pages: Math.ceil(allPlan.length / limit),
            data: allPlan,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getPurchasedPlan;