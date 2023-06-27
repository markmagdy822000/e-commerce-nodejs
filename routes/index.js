const categoryRoute = require("./categoryRoute");
const brandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const subCategoryRoute = require("./subCategoryRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const reviewRoute = require("./reviewRoute");
const whishlistRoute = require("./whishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/subCategories", subCategoryRoute);
  app.use("/api/v1/brands", brandRoute);
  app.use("/api/v1/products", productRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/review", reviewRoute);
  app.use("/api/v1/whishlist", whishlistRoute);
  app.use("/api/v1/address", addressRoute);
  app.use("/api/v1/coupons", couponRoute);
};

module.exports = mountRoutes;
