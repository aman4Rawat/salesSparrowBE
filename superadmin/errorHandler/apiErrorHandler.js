class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const finalErrorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode)
    if (statusCode === 500) return res.json({ status: false, message: error.message, stack: error.stack, error })
    res.json({ status: false, message: error.message })
}

module.exports = { ApiError, finalErrorHandler }