const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
    {
        email: {
            type: String, unique: true, required: [true, "Email is required!"], lowercase: true,
            validate: {
                validator: (value) => {
                    return /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value); // /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value)
                },
                message: 'Invalid email format',
            },
        },
        password: { type: String, minlength: 6, required: [true, "Password is required!"] },
        role: { type: String, enum: ['user', 'super_admin',], default: 'user', },
        permissions: { type: Array, default: [], }, // ["SFA", "DMS", "Lead Management", "Demo Control", "Edit Company", "Delete Company", "View Listing", "View Password", "Create Plan", "View Plan", "Create Company", "Create User", "Increase User", "None Billed", "Grass Period"]
        first_name: { type: String, default: "" },
        last_name: { type: String, default: "" },
        phone_number: { type: String, default: "" },
        profile_image: { type: String, default: "" },
        is_deleted: { type: Boolean, default: false },
        status: { type: Boolean, default: true },
    },
    { timestamps: true, }
)

// superAdminSchema.path('email').validate(async (value) => {                                             // giving error while updating user fields
//     const emailCount = await mongoose.model("superadmin").countDocuments({ email: value });
//     return !emailCount;
// }, 'Email already exists');

// superAdminSchema.pre('save', async function (next) {
//     const bcrypt = require('bcrypt');
//     const saltRounds = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, saltRounds);
//     next();
// });

const SuperAdmin = mongoose.model("superadmin", superAdminSchema);
module.exports = SuperAdmin;