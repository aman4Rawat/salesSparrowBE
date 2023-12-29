const connectToMongo = require("./models/db");
global.PROJECT_DIR = __dirname
const express = require("express");
const PORT = process.env.PORT || 5000;
const bodyparser = require("body-parser");
var cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const unspecifiedRouteHandler = require("./superadmin/routes/unspecifiedRouteHandler")
const { finalErrorHandler } = require("./superadmin/errorHandler/apiErrorHandler")

var app = express();

// Add logging middleware
app.use(morgan("combined"));
app.use(compression());
app.use(bodyparser.urlencoded({ extended: true, }));
app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE", }));
app.use(bodyparser.json());
app.use("/images", express.static(__dirname + "/images"));

app.get("/", (req, res) => res.status(200).json({ message: "Ping Successfully.", time: new Date() }));

app.use("/auth_api", require("./controllers/webservice/AuthAPIController"));
app.use("/auth_api", require("./controllers/webservice/subadminController"));
app.use("/auth_api", require("./controllers/webservice/roleController"));
app.use("/auth_api", require("./controllers/webservice/employeeController"));
app.use("/auth_api", require("./controllers/webservice/notificationController"));
app.use("/auth_api", require("./controllers/webservice/beatController"));
app.use("/auth_api", require("./controllers/webservice/partyController"));
app.use("/auth_api", require("./controllers/webservice/locationController"));
app.use("/auth_api", require("./controllers/webservice/cardController"));
app.use("/auth_api", require("./controllers/webservice/bankDetailsController"));
app.use("/auth_api", require("./controllers/webservice/messageController"));
app.use("/auth_api", require("./controllers/webservice/empTargetController"));
app.use("/auth_api", require("./controllers/webservice/goodDetailsController"));
app.use("/auth_api", require("./controllers/webservice/empGrpController"));
app.use("/auth_api", require("./controllers/webservice/leadController"));
app.use("/auth_api", require("./controllers/webservice/bannerController"));
app.use("/auth_api", require("./controllers/webservice/productCatagoryController"));
app.use("/auth_api", require("./controllers/webservice/productController"));
app.use("/auth_api", require("./controllers/webservice/routeController"));
app.use("/auth_api", require("./controllers/webservice/partyGrpController"));
app.use("/auth_api", require("./controllers/webservice/subscriptionController"));
app.use("/auth_api", require("./controllers/webservice/PurchaseSubController"));
app.use("/auth_api", require("./controllers/webservice/customerTypeController"));
app.use("/auth_api", require("./controllers/webservice/activityController"));
app.use("/auth_api", require("./controllers/webservice/partytypeController"));
// app.use("/auth_api", require("./controllers/webservice/productVarientController"));
app.use("/auth_api", require("./controllers/webservice/brandController"));
app.use("/auth_api", require("./controllers/webservice/productgrpController"));
app.use("/auth_api", require("./controllers/webservice/productUnitController"));
app.use("/auth_api", require("./controllers/webservice/pricelistingController"));
app.use("/auth_api", require("./controllers/webservice/reportController"));
app.use("/auth_api", require("./controllers/webservice/trackingController"));
app.use("/auth_api", require("./controllers/webservice/mappingController"));
app.use("/auth_api", require("./controllers/webservice/dashboardController"));
app.use("/auth_api", require("./controllers/webservice/setting"));

//-------------------lead---------------------------------//
app.use("/lead_api", require("./controllers/lead/LeadController"));

app.use("/app_api", require("./controller/appservices/empController"));
app.use("/app_api", require("./controller/appservices/changeBeatController"));
app.use("/app_api", require("./controller/appservices/notificationController"));
app.use("/app_api", require("./controller/appservices/attendanceController"));
app.use("/app_api", require("./controller/appservices/retailerController"));
app.use("/app_api", require("./controller/appservices/checkinController"));
app.use("/app_api", require("./controller/appservices/marketVisitController"));
app.use("/app_api", require("./controller/appservices/orderController"));
app.use("/app_api", require("./controller/appservices/reportsController"));
app.use("/app_api", require("./controller/appservices/claimController"));
app.use("/app_api", require("./controller/appservices/primaryOrderController"));
app.use("/app_api", require("./controller/appservices/goodsReturnController"));
app.use("/app_api", require("./controller/appservices/paymentCollectionController"));
app.use("/app_api", require("./controller/appservices/stockUpdateController"));
app.use("/app_api", require("./controller/appservices/trackingController"));
app.use("/app_api", require("./controller/appservices/leadController"));
app.use("/app_api", require("./controller/appservices/pricelistController"));

// super-admin
app.use("/root/user", require("./superadmin/routes/superAdminRoute"));
app.use("/root/plan", require("./superadmin/routes/planRoute"));
app.use("/root/company", require("./superadmin/routes/companyRoute"));

app.use(unspecifiedRouteHandler);
app.use(finalErrorHandler);

(async function startServer() {
  try {
    const db = await connectToMongo();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})()
