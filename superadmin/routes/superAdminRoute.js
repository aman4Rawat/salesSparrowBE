const superAdminRoute = require("express").Router()
const userAuth = require("../middlewares/userAuth");
const signupSuperAdmin = require("../controllers/superAdmin/auth/signupSuperAdmin");
const loginSuperAdmin = require("../controllers/superAdmin/auth/loginSuperAdmin");
const forgetPassword = require("../controllers/superAdmin/auth/forgetPassword");
const resetPassword = require("../controllers/superAdmin/auth/resetPassword");
const deleteSuperAdmin = require("../controllers/superAdmin/deleteSuperAdmin");
const getAllUsers = require("../controllers/superAdmin/getAllUsers");
const getUserDetails = require("../controllers/superAdmin/getUserDetails");
const updateProfile = require("../controllers/superAdmin/updateProfile");
const createUser = require("../controllers/superAdmin/createUser");

// post
superAdminRoute.post("/signup", signupSuperAdmin)
superAdminRoute.post("/login", loginSuperAdmin);
superAdminRoute.post("/forget_password", forgetPassword);
superAdminRoute.post("/reset_password", resetPassword);

superAdminRoute.post("/create_user", createUser);

// get
superAdminRoute.get("/all", getAllUsers);
// superAdminRoute.get("/details/:id", getUser);
superAdminRoute.get("/details", userAuth, getUserDetails);

// patch
superAdminRoute.patch("/", userAuth, updateProfile);
// superAdminRoute.patch("/profile_image", userAuth, updateProfileImage);
// superAdminRoute.patch("/password", userAuth, updatePassword);

// delete
superAdminRoute.delete("/:id", deleteSuperAdmin);
// superAdminRoute.delete("/all", deleteAllUsers);

module.exports = superAdminRoute;