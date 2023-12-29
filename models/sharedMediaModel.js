const mongoose = require("mongoose");

const sharedMedia_Model = new mongoose.Schema({
    sharedBy: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['Lead', 'Party', 'CustomerType']
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    }],
    opened: [String],
    unopened: [String],
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('SharedMedia', sharedMedia_Model)
