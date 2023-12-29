const mongoose = require('mongoose');

const followUp_Schema = new mongoose.Schema({
    followUpType: {
        type: String,
        required: [true, "Please provide type"],
        enum: ["PHONE", "NOTES", "MEETING", "MESSAGE"]
    },
    description: {
        type: String,
        required: [true, "Please provide description"]
    },
    date: {
        type: String,
        required: [true, "Please provide date"]
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please provide assignee data"],
        ref: 'Employee'
    },
    company_id: {
        type: String,
        default: 
    },
    created_date: {
        type: Date,
        default: Date.now(),
      },
    update_date: {
       type: Date,
       default: Date.now(),
    }
})

module.exports = mongoose.model('FollowUp', followUp_Schema)