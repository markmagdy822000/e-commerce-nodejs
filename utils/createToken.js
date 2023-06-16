const jwt = require("jsonwebtoken");

const createToken = (payload) =>
  jwt.sign({ userId: payload.userId }, process.env.JWT_SECRETE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

module.exports = createToken;
