// const validateMiddleware = require('./validatorMiddleware')

// refactor the error
const ApiError = require("../utils/apiError");

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

const handleJwtInvalidSignature = () =>
  new ApiError(`invlaid token please login in again`, 401);

const handleJwtExpired = () =>
  new ApiError(`expired token please login in again`, 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") sendErrorForDev(err, res);
  if (process.env.NODE_ENV === "production") {
    if (err.name == "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name == "TokenExpiredError") err = handleJwtExpired();
    sendErrorForProd(err, res);
  }
};
module.exports = { globalError };
