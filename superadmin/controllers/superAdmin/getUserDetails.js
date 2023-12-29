const getUserDetails = async (req, res, next) => {
    try {
        req.user.password = undefined;
        res.status(200).json({ status: true, message: "User detail fetched successfully.", data: req.user });
    } catch (error) {
        next(error);
    }
}

module.exports = getUserDetails;