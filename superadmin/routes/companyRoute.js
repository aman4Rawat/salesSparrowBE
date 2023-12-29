const companyRoute = require("express").Router();
const deleteCompany = require("../controllers/company/deleteCompany");
const getAllCompany = require("../controllers/company/getAllCompany");
const getCompanyListing = require("../controllers/company/getCompanyListing");
const getPurchasedPlan = require("../controllers/company/getPurchasedPlan");

// companyRoute.post("/", createPlan);
companyRoute.post("/", getAllCompany);
companyRoute.post("/purchased_plan", getPurchasedPlan);
companyRoute.post("/company_listing", getCompanyListing);
// companyRoute.patch("/", editPlan);
companyRoute.delete("/:id", deleteCompany);

module.exports = companyRoute;