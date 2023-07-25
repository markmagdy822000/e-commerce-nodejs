const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const { Coupon } = require("../models/couponModel");

const calculateTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
    cart.totalPriceAfterDiscount = undefined;
  });
  return totalPrice;
};

const addProductToCart = asyncHandler(async (req, res, next) => {
  // check if rigth code for this line
  const { productId, color } = req.body;
  const product = await Product.findOne({ _id: req.body.productId });

  // 1- if cart not exists create one
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          quantity: 1,
          color: color,
          price: product.price,
        },
      ],
    });
  } else {
    // 2- if cart exists check if product exists in cart
    // item is any element in array (any item in cartItems)
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color == color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      cart.cartItems.push({
        product: productId,
        quantity: 1,
        color: color,
        price: product.price,
      });
    }

    cart.totalCartPrice = calculateTotalCartPrice(cart);

    res.status(200).json({ cart });
    next();
  }

  await cart.save();
});

const getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  cart.totalPriceAfterDiscount = undefined;
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove specific cart item
// @route GET /api/v1/cart/:itemId
// @access Private/User
const removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id }, //get the user cart
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );
  await cart.save();
  cart.totalCartPrice = calculateTotalCartPrice(cart);
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove User Cart
// @route GET /api/v1/cart/
// @access Private/User
const clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc Update Cart Item Quantity
// @route GET /api/v1/cart/:itemId
// @access Private/User
const updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }

  // eslint-disable-next-line array-callback-return
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() == req.params.itemId.toString()
  );
  if (itemIndex != -1) cart.cartItems[itemIndex].quantity = req.body.quantity;
  else {
    return next(new ApiError(`Item not found of id ${req.params.itemId}`, 404));
  }
  cart.totalCartPrice = calculateTotalCartPrice(cart);
  await cart.save();
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

const applyCoupon = asyncHandler(async (req, res, next) => {
  //1- get th coupon code from the request
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });
  if (!coupon) return next(new ApiError("Invalid Coupon", 404));

  // 2- get the cart to apply the coupon on
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return next(new ApiError("Cart not found", 404));

  cart.totalPriceAfterDiscount = (
    cart.totalCartPrice -
    (cart.totalCartPrice * coupon.discount) / 100
  ).toFixed(2);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

module.exports = {
  addProductToCart,
  getLoggedUserCart,
  applyCoupon,
  removeSpecificCartItem,
  clearCart,
  updateCartItemQuantity,
};
