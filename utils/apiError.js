//this class is responsible for operational errors that I can predict
// get info about the error
class ApiError extends Error {
  constructor(messsage, statusCode) {
    super(messsage);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; //could I predict that error? true
  }
}

module.exports = ApiError;
