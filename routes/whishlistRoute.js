const express = require("express");

const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  addProductToWishlist,
  getMyWishlist,
  removeProductFromWishlist,
} = require("../services/wishlistService");

router.use(protect, allowedTo("user"));

router
  .route("/")
  .post(addProductToWishlist)
  .delete(removeProductFromWishlist)
  .get(getMyWishlist);

module.exports = router;
