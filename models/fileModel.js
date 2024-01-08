const mongoose = require("mongoose");

const file_schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide valid title"],
    },
    description: {
      type: String,
    },
    company_id: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
    },
    // website: {
    //  name: {type: String, default: ""},
    //  url: {type: String, default: ""}
    // },
    websiteName: {
      type: String,
      default: "",
    },
    websiteUrl: {
      type: String,
      default: "",
    },
    sharedCount: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
    },
    date: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ["CATALOGUE", "PDF"],
    },
    status: {
      type: String,
      default: "Inactive",
    },
    pdf: [String],
    feedBy: {
      type: String,
    },
    feedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    is_delete: {
      type: String,
      default: "0",
    },
    created_date: {
      type: Date,
      default: Date.now(),
    },
    update_date: {
      type: Date,
      default: Date.now(),
    },
  }
  // ,{
  //     toJSON:{
  //         transform(doc,rec){
  //             delete rec.is_delete;
  //             delete rec.created_date;
  //             delete rec.update_date;
  //             delete rec.__v;
  //         }
  //     },
  // }
);
module.exports = mongoose.model("File", file_schema);
