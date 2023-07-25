const express = require("express");

const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  removeAdress,
  addAddress,
  getAddress,
} = require("../services/addressService");

router.use(protect, allowedTo("user"));

router.route("/").post(addAddress).delete(removeAdress).get(getAddress);

module.exports = router;
