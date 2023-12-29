const mongoose = require("mongoose");

async function connectToMongo() {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      "mongodb+srv://salesparrowcrm:mksinglamongodb@cluster0.tv29ucv.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    );

    mongoose.connection.once("open", () => {
      console.log("MongoDB Connection Succeeded.");
      resolve();
    });

    mongoose.connection.on("error", (error) => {
      console.log("Error in DB connection:", error);
      reject(error);
    });
  });
}

module.exports = connectToMongo;

require("./adminModel");
require("./nightstayModel");
require("./messageModel");
require("./demoModel");
require("./notificationModel");
require("./fileModel");
require("./leaveModel");
require("./roleModel");
require("./countryModel");
require("./subAdminModel");
require("./employeeModel");
require("./beatModel");
require("./partyModel");
require("./locationModel");
require("./cardModel");
require("./bankDetailsModel");
require("./empTargetModel");
require("./goodDetailsModel");
require("./empGroupingModel");
require("./groupModel");
require("./leadModel");
require("./bannerModel");
require("./productCatagoryModel");
require("./productModel");
// require('./productVarientModel');
require("./routeModel");
require("./pgroupModel");
require("./partyGrouping");
require("./subscriptionModel");
require("./purchaseSubModel");
require("./changeBeatModel");
require("./attendanceModel");
require("./retailerModel");
require("./customerTypeModel");
require("./activityModel");
require("./partytypeModel");
require("./checkinModel");
require("./brandModel");
require("./productGroupingModel");
require("./productgrpModel");
require("./orderModel");
require("./orderItemModel");
require("./productUnitModel");
require("./visitModel");
require("./pricelistModel");
require("./salesReportModel");
require("./claimModel");
require("./PrimaryOrderItemModel");
require("./primaryOrderModel");
require("./goodReturnVoucherModel");
require("./expenseReportModel");
require("./paymentCollectionModel");
require("./stockModel");
require("./stockItemModel");
require("./goodsReturnModel");
require("./goodsReturnItemsModel");
require("./leadGroupModel");
require("./leadBannerModel");
require("./followUpModel");
// require('./leadFollow_upModel');
require("./leadGroupDataModel");
require("./invoiceModel");
require("./retailerFeedbackModel");
require("./trackingModel");
require("./deviceStatusModel");
require("./mappingModel");
require("./salaryPercentageModel");

// new
require("./primaryVisitModel")
require("./purchasedPlanModel");

require("./sharedMediaModel");
