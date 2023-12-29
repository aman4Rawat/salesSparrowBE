const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visit_schema = new Schema({
    emp_id: {
        type: String,
    },
    beat_id: {
        type: String,
    },
    party_id: {
        type: String,
    },
    date: {
        type: String
    },
    Created_date: {
        type: String,
        default: ""
    },
    Updated_date: {
        type: String,
        default: ""
    },
    is_delete: {
        type: String,
        default: "0"
    },
    status: {
        type: String,
        default: 'InActive'
    }
}, { strict: false });

module.exports = mongoose.model('PrimaryVisit', visit_schema)