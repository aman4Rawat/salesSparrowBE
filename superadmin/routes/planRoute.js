const planRoute = require("express").Router();
const createPlan = require("../controllers/plan/createPlan");
const getAllPlan = require("../controllers/plan/getAllPlan");
const editPlan = require("../controllers/plan/editPlan");
const deletePlan = require("../controllers/plan/deletePlan");

planRoute.post("/", createPlan);
planRoute.get("/", getAllPlan);
planRoute.patch("/", editPlan);
planRoute.delete("/:id", deletePlan);

module.exports = planRoute;