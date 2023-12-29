const mongoose = require('mongoose');
const Admin = mongoose.model('AdminInfo');
const Location = mongoose.model('Location');

const getCompanyListing = async (req, res, next) => {
    try {
        let { page, limit, state } = req.body;

        page = page && page;
        limit = limit && limit;
        let findCondition = { is_delete: "0", status: "Active" };
        if (state) findCondition.state = state;

        let allCompany = await Admin.find(findCondition)
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ Created_date: -1 });


        if (allCompany.length === 0) return res.status(200).json({ status: true, message: "no company found", data: [] });
        res.status(200).json({
            status: true,
            message: "All company fetched successfully!",
            total_users: allCompany.length,
            total_pages: Math.ceil(allCompany.length / limit),
            data: allCompany,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getCompanyListing;