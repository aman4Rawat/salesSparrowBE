const mongoose = require('mongoose');
const Admin = mongoose.model('AdminInfo');
const Location = mongoose.model('Location');
const Employee = mongoose.model("Employee");

const getAllCompany = async (req, res, next) => {
    try {
        let { page, limit, type, state } = req.body;

        page = page ? page : 1;
        limit = limit ? limit : 10;
        let findCondition = { is_delete: "0", status: "Active" };
        if (state) findCondition.state = state;

        let allCompany = await Admin.find(findCondition)
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ Created_date: -1 });

        const companyArr = [];
        let date = new Date().getTime();
        for (let i = 0; i < allCompany.length; i++) {
            const company = allCompany[i].toJSON();
            if (company[type]?.startDate && company[type]?.endDate) {
                let emp = await Employee.countDocuments({companyId: company._id})
                let startDate = new Date(company[type].startDate).getTime();
                let endDate = new Date(company[type].endDate).getTime();
                if (startDate < date && endDate > date) {
                    const state_data = await Location.findOne({ id: company.state })
                    let city_data = await Location.findOne({ id: company.city });
                    company.state = { name: state_data.name, id: state_data.id };
                    company.city = { name: city_data.name, id: city_data.id };
                    company.registeredUser = emp
                }
                companyArr.push(company);
            }
        }
        if (companyArr.length === 0) return res.status(200).json({ status: true, message: "no company found", data: [] });

        res.status(200).json({
            status: true,
            message: "All company fetched successfully!",
            total_users: companyArr.length,
            total_pages: Math.ceil(companyArr.length / limit),
            data: companyArr,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getAllCompany;