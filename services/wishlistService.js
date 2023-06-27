const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

const removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product is removed from your wishlist.",
    data: user.wishlist,
  });
});

const getMyWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist", {
    select: "title",
  });

  res.status(200).json({
    status: "success",
    result: user.wishlist.length,
    data: user.wishlist,
  });
});

module.exports = {
  getMyWishlist,
  addProductToWishlist,
  removeProductFromWishlist,
};
