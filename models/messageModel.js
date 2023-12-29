const mongoose = require("mongoose");

const message_schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
            default: ""
        },
        company_id: {
            type: String,
            required: true,
        },
        feedBy: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        is_delete: {
            type: String,
            default: "0"
        },
        Created_date: {
            type: Date,
            default: Date.now
        },
        shared: {
            type: Number,
            default: 0
        },
        Updated_date: {
            type: Date,
            default: Date.now
        }
    },
    {
        toJSON: {
            transform(doc, rec) {
                delete rec.is_delete;
                delete rec.Created_date;
                delete rec.Updated_date;
                delete rec.__v;
            }
        },
    });

module.exports = mongoose.model("Message", message_schema)