const express = require('express');
const mongoose = require('mongoose');
const SubscriptionPlan = mongoose.model("subs");
const router = express.Router();

router.post('/addSubscription', async (req, res) => {
  console.log('add subscription');
  const { type, ems, dms } = req.body;
  const newSub = new SubscriptionPlan({
    type,
    ems,
    dms,
  });
  const savedDoc = await newSub.save();
  res
    .status(201)
    .json({ status: true, message: 'Added', result: savedDoc });
});
router.get('/listAllSubs', async (req, res) => {
  const allSubs = await SubscriptionPlan.find({});
  res.status(200).json({ status: true,message:"All plans found successfully", result :allSubs});
});
router.delete('/delSubs/:subId', async (req, res) => {
  const _id = req.params.subId;
  await SubscriptionPlan.findOneAndDelete({ _id });
  res.status(200).json({ status: true, message: 'Deleted' });
});

// new
router.post("/purchase_plan", async (req, res) => {
  try {
    let { companyID, plan, userCount, durationCount, totalPayment, startDate, endDate } = req.body;
    if (!companyID) return res.json({ status: false, message: "companyID is required" });
    if (!plan) return res.json({ status: false, message: "plan is required" });
    if (!userCount) return res.json({ status: false, message: "userCount is required" });
    if (!durationCount) return res.json({ status: false, message: "durationCount is required" });
    if (!totalPayment) return res.json({ status: false, message: "totalPayment is required" });
    if (!startDate) return res.json({ status: false, message: "startDate is required" });
    if (!endDate) return res.json({ status: false, message: "endDate is required" });

    let company = await Admin.findById(companyID);

    let tempStartDate = new Date(startDate);
    let companyStartDate = new Date(company[plan.plan_name].startDate);
    let companyEndDate = new Date(company[plan.plan_name].endDate);

    let newPlan;
    let updatedAdmin;
    if (companyEndDate > tempStartDate) {
      companyStartDate = companyStartDate.toLocaleDateString();
      let planStartDate = new Date(companyEndDate).toLocaleDateString();
      endDate = new Date(new Date(companyEndDate).setMonth(new Date(companyEndDate).getMonth() + durationCount)).toLocaleDateString();
      newPlan = await PurchasedPlan.create({ plan, userCount, durationCount, totalPayment, startDate: planStartDate, endDate, planPurchaseDate: startDate, companyID });
      updatedAdmin = await Admin.findByIdAndUpdate(companyID, { [plan.plan_name]: { plan, userCount, durationCount, totalPayment, startDate: companyStartDate, endDate, billed: true }, demo_control: { startDate: "", endDate: "", plan: {} } }, { new: true });
    } else {
      newPlan = await PurchasedPlan.create({ plan, userCount, durationCount, totalPayment, startDate, planPurchaseDate: startDate, endDate, companyID });
      updatedAdmin = await Admin.findByIdAndUpdate(companyID, { [plan.plan_name]: { plan, userCount, durationCount, totalPayment, startDate, endDate, billed: true }, demo_control: { startDate: "", endDate: "", plan: {} } }, { new: true });
    }

    res.status(201).json({ status: true, message: 'Added', result: { newPlan, updatedAdmin } });
  } catch (error) {
    console.log(error);
    res.send(error.message);
  }
})

module.exports = router;