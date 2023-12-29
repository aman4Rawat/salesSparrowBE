var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({
    company_name: {
        type: String,
        required: 'This is mendatory',
    },
    phone: {
        type: Number,
        required: 'This is mendatory',
    },
    password: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    pincode: {
        type: Number,
        default: ""
    },
    GSTNo: {
        type: String,
        default: ""
    },
    companyAddress: {
        type: String,
        default: ""
    },
    companyShortCode: {
        type: String,

    },
    companyShortCode2: {
        type: Number,
        default: 0

    },
    companyCatagory: {
        type: String,
        default: ""
    },
    companyDescription: {
        type: String,
        default: ""
    },
    companyType: {
        type: String,
        default: ""
    },
    contactPersonName: {
        type: String,
        default: ""
    },
    // district:{
    //     type:String,
    //     default:""
    // },
    signatureImage: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    attendance_feature: {
        selfie: { type: Boolean, default: true, },
        distributor_name: { type: Boolean, default: true, },
        beat_name: { type: Boolean, default: true, },
        punch_location: { type: Boolean, default: true, },
        activity: { type: Boolean, default: true, },
        sales_report_compulsory: { type: Boolean, default: false, },
        expense_report_compulsory: { type: Boolean, default: false, },
    },
    approval_feature: {
        beat_plan_approval: { type: Boolean, default: false, },
        expense_report_approval: { type: Boolean, default: false, },
        employee_target_approval: { type: Boolean, default: false, },
    },
    expense_feature: {
        type: String, default: "location"
    },
    location_tracking_feature: {
        attendance_type: { type: String, default: "attendance" },
        start_time: { type: String, default: "" },
        end_time: { type: String, default: "" },
    },

    sfa: {
        durationCount: { type: String, default: "", },
        endDate: { type: String, default: "", },
        startDate: { type: String, default: "", },
        totalPayment: { type: String, default: "", },
        userCount: { type: String, default: "", },
        plan: { type: Object, default: {}, },
    },
    dms: {
        durationCount: { type: String, default: "", },
        endDate: { type: String, default: "", },
        startDate: { type: String, default: "", },
        totalPayment: { type: String, default: "", },
        userCount: { type: String, default: "", },
        plan: { type: Object, default: {}, },
    },
    lead_management: {
        durationCount: { type: String, default: "", },
        endDate: { type: String, default: "", },
        startDate: { type: String, default: "", },
        totalPayment: { type: String, default: "", },
        userCount: { type: String, default: "", },
        plan: { type: Object, default: {}, },
    },
    demo_control: Object,
    tracking_time: { type: String, default: "5" },

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
module.exports = mongoose.model('AdminInfo', AdminSchema);