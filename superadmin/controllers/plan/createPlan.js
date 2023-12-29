const { ApiError } = require("../../errorHandler/apiErrorHandler");
const Plan = require("../../models/planModel");

const createPlan = async (req, res, next) => {
    try {
        let { plan_name, cost_per_user_per_month, billing_frequency, discount, minimum_user, features } = req.body;

        let basic_features = ["Live Dashboard", "Live Tracking", "Team Location", "Beat & Route Management", "Employee Management", "Party Management", "Attendance & Expanse Report"]
        let standard_features = [...basic_features, "Product Management", "Primary Order Management", "Secondary Order Manahement", "Multiple Price List", "View & Generate invoice", "Team Dashboard", "Dynamic report", "View Catalogue", "Collection Management"]
        let premium_features = [...standard_features, "Scheme Management", "Create Target Scheme", "Create Coupons", "Live Lucky Draw", "Achieved Price Management", "Pending Price Management", "Delivered Price Management"]

        let feature_includes;
        if (features === "basic") feature_includes = basic_features;
        else if (features === "standard") feature_includes = standard_features;
        else feature_includes = premium_features;

        let oldPlan = await Plan.findOne({ plan_name, features });
        if (oldPlan) throw new ApiError("Plan already exist!", 400);

        let newPlan = await Plan.create({ plan_name, cost_per_user_per_month, billing_frequency, discount, minimum_user, features, feature_includes })
        res.status(201).json({ status: true, message: "Plan created successfully.", data: newPlan });
    } catch (error) {
        next(error);
    }
}

module.exports = createPlan;