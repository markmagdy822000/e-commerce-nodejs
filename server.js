const path = require("path");

const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const compression = require("compression");

dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const mountRoutes = require("./routes"); // no need to write index (it is read by default)

// Express app
const app = express();

app.use(cors());
app.options("*", cors());
// s
app.use(compression());

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
mountRoutes(app);

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
