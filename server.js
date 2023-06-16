const path = require("path");

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const categoryRoute = require("./routes/categoryRoute");
const brandRoute = require("./routes/brandRoute");
const productRoute = require("./routes/productRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const reviewRoute = require("./routes/reviewRoute");

// Express app
const app = express();
const ApiError = require("./utils/apiError");
const { globalError } = require("./middlewares/errorMiddleware");
// 1-Connect to Database
dbConnection();

// Middlewares
app.use(express.json());
// get the image
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// 2-Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subCategories", subCategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/review", reviewRoute);

app.use("*", (req, res, next) => {
  next(new ApiError(`can not find URL ${req.originalUrl}`, 400));
});
// 3- get the error when use 4 parameters
// if no error in the previous middleware it will not enter here
// Error handling middleware i.e function that convert error from `HTML` to `JSON` to be customized

app.use(globalError);
const { PORT } = process.env;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handling rejections outside express
process.on("unhandledRejection", (err) => {
  console.log(`UnhandledRejection Error ${err.name} | ${err.message}`);

  server.close(() => {
    console.log(`Shutting down...`);
    process.exit(1);
  });
});
