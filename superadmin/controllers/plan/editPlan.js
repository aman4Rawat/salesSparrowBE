const Plan = require("../../models/planModel");

const editPlan = async (req, res, next) => {
    try {
        let { id, plan_name, cost_per_user_per_month, billing_frequency, discount, minimum_user, features, status } = req.body;

        let updatedObj = {}
        if (plan_name) updatedObj.plan_name = plan_name;
        if (cost_per_user_per_month) updatedObj.cost_per_user_per_month = cost_per_user_per_month;
        if (billing_frequency) updatedObj.billing_frequency = billing_frequency;
        if (discount) updatedObj.discount = discount;
        if (minimum_user) updatedObj.minimum_user = minimum_user;
        if (features) {
            updatedObj.features = features;
            let basic_features = ["Live Dashboard", "Live Tracking", "Team Location", "Beat & Route Management", "Employee Management", "Party Management", "Attendance Report"]
            let standard_features = [...basic_features, "Product Management", "Primary Order Management", "Secondary Order Manahement", "Multiple Price List", "View & Generate invoice", "Team Dashboard", "Dynamic report", "View Catalogue", "Collection Management"]
            let premium_features = [...standard_features, "Scheme Management", "Create Target Scheme", "Create Coupons", "Live Lucky Draw", "Achieved Price Management", "Pending Price Management", "Delivered Price Management"]

            let feature_includes;
            if (features === "basic") feature_includes = basic_features;
            else if (features === "standard") feature_includes = standard_features;
            else feature_includes = premium_features;
            updatedObj.feature_includes = feature_includes;
        }
        // if (status) updatedObj.status = status;

        let updatedPlan = await Plan.findByIdAndUpdate(id, updatedObj, { new: true });
        res.status(200).json({ status: true, message: "Plan details updated successfully!", data: updatedPlan });
    } catch (error) {
        next(error);
    }
}

module.exports = editPlan;