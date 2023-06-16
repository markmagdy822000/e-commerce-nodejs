const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose.connect(process.env.DB_URI).then((connection) => {
    console.log(`DB connection successful: ${connection.connection.host}`);
  });
};
module.exports = dbConnection;
