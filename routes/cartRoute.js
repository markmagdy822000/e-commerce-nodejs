const express = require("express");

const router = express.Router();
const { protect, allowedTo } = require("../services/authService");
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");

//TODO:  you have to validate that user uses his cart
router.use(protect, allowedTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.route("/applyCoupon").put(applyCoupon);
router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

module.exports = router;
