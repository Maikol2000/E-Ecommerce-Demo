const UserRouter = require("./UserRouter");
const AuthRouter = require("./AuthRouter");
const ProductRouter = require("./ProductRouter");
const OrderRouter = require("./OrderRouter");
const PaymentRouter = require("./PaymentRouter");
const ProductTypeRouter = require("./ProductTypeRouter");
const ReviewRouter = require("./ReviewRouter");
const RoleRouter = require("./RoleRouter");
const CityRouter = require("./CityRouter");
const DeliveryTypeRouter = require("./DeliveryTypeRouter");
const PaymentTypeRouter = require("./PaymentTypeRouter");
const ReportRouter = require("./ReportRouter");

const routes = (app) => {
  app.use("/auth", AuthRouter);
  app.use("/users", UserRouter);
  app.use("/products", ProductRouter);
  app.use("/product-types", ProductTypeRouter);
  app.use("/orders", OrderRouter);
  app.use("/payment", PaymentRouter);
  app.use("/reviews", ReviewRouter);
  app.use("/roles", RoleRouter);
  app.use("/city", CityRouter);
  app.use("/delivery-type", DeliveryTypeRouter);
  app.use("/payment-type", PaymentTypeRouter);
  app.use("/report", ReportRouter);
};

module.exports = routes;
